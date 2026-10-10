import { useEffect, useRef, useState, type FormEvent } from 'react';
import { communityApi as api, CommunityApiError, type BlockedUser, type CircleMember, type CommunityPost, type CommunityReport, type CommunityUser, type ServerCircle } from './communityApi';
import { validateCircle, type CircleDraft } from './community';

const blank: CircleDraft = { name: '', description: '', visibility: 'private', rulesAccepted: false };
export function ConnectedCommunity() {
  const [user, setUser] = useState<CommunityUser | null>(null);
  const [ready, setReady] = useState(false);
  const [register, setRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [adult, setAdult] = useState(false);
  const [rules, setRules] = useState(false);
  const [circles, setCircles] = useState<ServerCircle[]>([]);
  const [active, setActive] = useState<ServerCircle | null>(null);
  const [draft, setDraft] = useState<CircleDraft>(blank);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [blocks, setBlocks] = useState<BlockedUser[]>([]);
  const [postText, setPostText] = useState('');
  const [invitation, setInvitation] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [reason, setReason] = useState('');
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const creation = useRef<{ payload: string; key: string } | null>(null);
  const busy = useRef(false);
  const moderator = active?.membership?.state === 'active' && ['owner', 'moderator'].includes(active.membership.role);
  const owner = active?.membership?.role === 'owner';

  useEffect(() => {
    let mounted = true;
    api.session().then(result => { if (mounted) setUser(result.user); }).catch(error => {
      if (mounted && (!(error instanceof CommunityApiError) || error.status !== 401)) setMessage(error.message);
    }).finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);

  async function refreshCircles() {
    const result = await api.circles();
    setCircles(result.circles);
    return result.circles;
  }
  async function loadCircle(circle: ServerCircle) {
    setActive(null); setPosts([]); setMembers([]); setReports([]); setInviteToken(''); setReportTarget(null); setReason(''); setPostText('');
    const data = await api.posts(circle.id);
    if (['owner', 'moderator'].includes(circle.membership?.role ?? '')) {
      const [m, r] = await Promise.all([api.members(circle.id), api.reports(circle.id)]);
      setMembers(m.members); setReports(r.reports);
    }
    setPosts(data.posts); setActive(circle);
  }
  async function reloadActive() {
    if (!active) return;
    const [data, list] = await Promise.all([api.posts(active.id), api.circles()]);
    setPosts(data.posts); setCircles(list.circles);
    const current = list.circles.find(c => c.id === active.id);
    if (!current || current.membership?.state !== 'active') { setActive(null); return; }
    setActive(current);
    if (['owner', 'moderator'].includes(current.membership.role)) {
      const [m, r] = await Promise.all([api.members(active.id), api.reports(active.id)]);
      setMembers(m.members); setReports(r.reports);
    } else { setMembers([]); setReports([]); }
  }
  async function perform(task: () => Promise<void>) {
    if (busy.current) return;
    busy.current = true; setPending(true); setMessage('');
    try { await task(); }
    catch (error) {
      setMessage(error instanceof Error ? error.message : 'Community request failed.');
      if (error instanceof CommunityApiError && error.status === 401) { setUser(null); setActive(null); setPosts([]); setCircles([]); setMembers([]); setReports([]); setBlocks([]); }
      if (error instanceof CommunityApiError && [403, 404].includes(error.status)) { setActive(null); setPosts([]); setMembers([]); setReports([]); }
    } finally { busy.current = false; setPending(false); }
  }
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    Promise.all([api.circles(), api.blocks()]).then(([c, b]) => { if (mounted) { setCircles(c.circles); setBlocks(b.blocks); } }).catch(error => { if (mounted) setMessage(error.message); });
    return () => { mounted = false; };
  }, [user]);

  function authenticate(event: FormEvent) {
    event.preventDefault();
    void perform(async () => {
      const result = register ? await api.register(username, displayName, password, adult, rules) : await api.login(username, password);
      setUser(result.user); setPassword(''); setMessage(`Welcome, ${result.user.displayName}.`);
    });
  }
  function createCircle(event: FormEvent) {
    event.preventDefault();
    void perform(async () => {
      const error = validateCircle(draft); if (error) throw new Error(error);
      const normalized = { ...draft, name: draft.name.trim(), description: draft.description.trim() };
      const payload = JSON.stringify(normalized);
      const request = creation.current?.payload === payload ? creation.current : { payload, key: crypto.randomUUID() };
      creation.current = request;
      const result = await api.createCircle(normalized, request.key);
      setDraft(blank); creation.current = null; setMessage('Circle created. You are its owner.');
      await refreshCircles(); await loadCircle(result.circle);
    });
  }
  async function moderateMember(member: CircleMember, action: string) {
    if (reason.trim().length < 5) throw new Error('Enter a moderation reason of at least five characters.');
    await api.membership(active!.id, member.id, action, reason); await reloadActive(); setMessage('Membership updated and action recorded.');
  }
  const status = <p role="status" className="notice" aria-live="polite">{pending ? 'Working…' : message || 'Connected to the community server. Your private practice journal stays on this device.'}</p>;
  if (!ready) return <p role="status">Checking your community session…</p>;
  if (!user) return <section aria-labelledby="community-heading">
    <p className="eyebrow">PRACTICE TOGETHER</p><h2 id="community-heading">Community</h2>{status}
    <p>Accounts are for adults, 18 and older. Solo practice and your private journal do not require an account.</p>
    <div className="mode"><button aria-pressed={!register} onClick={() => { setRegister(false); setPassword(''); }}>Sign in</button><button aria-pressed={register} onClick={() => { setRegister(true); setPassword(''); }}>Create account</button></div>
    <form className="panel" onSubmit={authenticate}><fieldset disabled={pending}>
      <legend>{register ? 'Create your community account' : 'Sign in to community'}</legend>
      <label htmlFor="community-username">Username</label><input id="community-username" required minLength={3} maxLength={32} pattern="[a-zA-Z0-9_-]+" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)}/>
      {register && <><label htmlFor="community-name">Display name</label><input id="community-name" required minLength={2} maxLength={60} autoComplete="nickname" value={displayName} onChange={e => setDisplayName(e.target.value)}/></>}
      <label htmlFor="community-password">Password (12–128 characters)</label><input id="community-password" type="password" required minLength={12} maxLength={128} autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)}/>
      {register && <><label className="toggle"><input type="checkbox" required checked={adult} onChange={e => setAdult(e.target.checked)}/> I am 18 or older</label><p>No harassment, coercion, covert influence or targeting strangers. Respect privacy and consent. Historical telepathy claims are not scientifically established.</p><label className="toggle"><input type="checkbox" required checked={rules} onChange={e => setRules(e.target.checked)}/> I accept these community rules</label><p className="muted">Keep your password safe. Password recovery is not available in this release.</p></>}
      <button type="submit">{register ? 'Create account' : 'Sign in'}</button>
    </fieldset></form>
  </section>;

  return <section aria-labelledby="community-heading"><p className="eyebrow">PRACTICE TOGETHER</p><h2 id="community-heading">Community</h2>{status}
    <div className="actions"><span>Signed in as {user.displayName}</span><button disabled={pending} className="secondary" onClick={() => void perform(async () => { await api.logout(); setUser(null); setActive(null); setCircles([]); setPosts([]); setMembers([]); setReports([]); setBlocks([]); setMessage('Signed out.'); })}>Sign out</button><button disabled={pending} className="secondary" onClick={() => void perform(async () => { await refreshCircles(); await reloadActive(); setMessage('Community refreshed.'); })}>Refresh</button></div>
    {active ? <>
      <button className="back" disabled={pending} onClick={() => { setActive(null); setPosts([]); setReportTarget(null); }}>← All circles</button>
      <h3>{active.name}</h3><p>{active.description}</p><p className="muted">{active.visibility === 'private' ? 'Private circle' : 'Discoverable circle'} · {active.membership?.role} · Discussions visible to approved members only.</p>
      <div className="actions">{moderator && <button disabled={pending} onClick={() => void perform(async () => { setInviteToken((await api.invite(active.id)).token); })}>Create single-use invitation</button>}{owner ? <button className="secondary" disabled={pending} onClick={() => { if (window.confirm('Delete this circle and all its discussions? This cannot be undone.')) void perform(async () => { await api.deleteCircle(active.id); setActive(null); setPosts([]); await refreshCircles(); setMessage('Circle deleted.'); }); }}>Delete circle</button> : <button className="secondary" disabled={pending} onClick={() => { if (window.confirm('Leave this circle? You will need approval to return.')) void perform(async () => { await api.leave(active.id); setActive(null); await refreshCircles(); }); }}>Leave circle</button>}</div>
      {inviteToken && <div className="notice"><p>Share this code privately with one consenting adult. It expires in 24 hours and submits a membership request for approval.</p><label htmlFor="invite-code">Invitation code</label><input id="invite-code" readOnly value={inviteToken}/></div>}
      <h3>Discussions</h3><p className="muted">Messages are shared with circle members. Do not post someone else’s private reflections. Refresh to see new messages.</p>
      {!posts.length && <p className="empty">No visible discussions yet.</p>}
      {posts.map(post => <article className="entry" key={post.id}><strong>{post.author}</strong><p className="muted"><time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString()}</time>{post.hidden && ' · Hidden from members'}</p><p className="community-body">{post.body}</p><div className="actions">
        {post.authorId === user.id ? <button className="secondary" disabled={pending} onClick={() => void perform(async () => { await api.deletePost(active.id, post.id); await reloadActive(); })}>Delete my post</button> : <><button className="secondary" disabled={pending} onClick={() => { setReportTarget(post.id); setReason(''); }}>Report post</button>{post.authorId && <button className="secondary" disabled={pending} onClick={() => void perform(async () => { await api.block(post.authorId!); setBlocks((await api.blocks()).blocks); await reloadActive(); setMessage('Account blocked. Moderators can still review all circle content.'); })}>Block account</button>}</>}
        {moderator && !post.hidden && <button className="secondary" disabled={pending} onClick={() => void perform(async () => { if (reason.trim().length < 5) throw new Error('Enter a moderation reason below first.'); await api.hide(active.id, post.id, reason); await reloadActive(); })}>Hide post</button>}
      </div></article>)}
      {reportTarget && <form className="panel" onSubmit={e => { e.preventDefault(); void perform(async () => { await api.report(active.id, reportTarget, reason); setReportTarget(null); setReason(''); setMessage('Report sent to circle moderators. Your identity is not shown in the report queue.'); }); }}><label htmlFor="report-reason">Report reason</label><textarea id="report-reason" required minLength={5} maxLength={1000} value={reason} onChange={e => setReason(e.target.value)}/><div className="actions"><button disabled={pending} type="submit">Submit report</button><button disabled={pending} type="button" className="secondary" onClick={() => setReportTarget(null)}>Cancel</button></div></form>}
      <form className="panel" onSubmit={e => { e.preventDefault(); void perform(async () => { await api.post(active.id, postText); setPostText(''); await reloadActive(); setMessage('Discussion posted.'); }); }}><label htmlFor="discussion-body">Write a shared discussion</label><textarea id="discussion-body" required maxLength={4000} value={postText} onChange={e => setPostText(e.target.value)} rows={4}/><button disabled={pending} type="submit">Post to circle</button></form>
      {moderator && <section aria-labelledby="moderation-heading"><h3 id="moderation-heading">Circle moderation</h3><p className="muted">Moderators can review blocked and hidden content in this circle. Decisions are recorded in an audit log.</p><label htmlFor="moderation-reason">Reason for the next moderation action</label><textarea id="moderation-reason" minLength={5} maxLength={1000} value={reason} onChange={e => setReason(e.target.value)}/><h4>Members and requests</h4>{members.map(member => <article className="entry" key={member.id}><strong>{member.displayName}</strong><p>{member.role} · {member.state}</p><div className="actions">{member.id !== user.id && member.role !== 'owner' && (owner || member.role !== 'moderator') && <>
        {member.state === 'pending' && <button disabled={pending} onClick={() => void perform(() => moderateMember(member, 'approve'))}>Approve request</button>}
        {member.state !== 'banned' && <button className="secondary" disabled={pending} onClick={() => void perform(() => moderateMember(member, 'ban'))}>Ban member</button>}
        {owner && member.state === 'active' && <button className="secondary" disabled={pending} onClick={() => void perform(() => moderateMember(member, member.role === 'moderator' ? 'demote' : 'promote'))}>{member.role === 'moderator' ? 'Remove moderator role' : 'Make moderator'}</button>}
      </>}</div></article>)}<h4>Open reports</h4>{!reports.length && <p>No open reports.</p>}{reports.map(report => <article className="entry" key={report.id}><p className="community-body">{report.body}</p><p>Reason: {report.reason}</p><button disabled={pending} onClick={() => void perform(async () => { if (reason.trim().length < 5) throw new Error('Enter a resolution reason first.'); await api.resolve(active.id, report.id, reason); await reloadActive(); })}>Resolve report</button></article>)}</section>}
    </> : <>
      <h3>Your circles and discoverable groups</h3><p className="muted">Discoverable descriptions are visible to signed-in adults; discussions are private to approved members. No groups are seeded as pretend practitioners.</p>
      {!circles.length && <p className="empty">No circles yet. Create a circle or accept a private invitation.</p>}
      <div className="cards">{circles.map(circle => <article className="feature" key={circle.id}><h3>{circle.name}</h3><p>{circle.description}</p><p>{circle.visibility} · {circle.membership?.state ?? 'Not a member'}</p>{circle.membership?.state === 'active' ? <button disabled={pending} onClick={() => void perform(() => loadCircle(circle))}>Open discussions</button> : circle.membership ? <span className="status">{circle.membership.state === 'pending' ? 'Awaiting moderator approval' : 'Membership unavailable'}</span> : <button disabled={pending} onClick={() => void perform(async () => { await api.join(circle.id); await refreshCircles(); setMessage('Request sent. A moderator must approve your membership.'); })}>Request membership</button>}</article>)}</div>
      <form className="panel" onSubmit={e => { e.preventDefault(); void perform(async () => { await api.accept(invitation.trim()); setInvitation(''); await refreshCircles(); setMessage('Invitation accepted. Awaiting membership approval.'); }); }}><label htmlFor="private-invitation">Private invitation code</label><input id="private-invitation" required minLength={64} maxLength={64} value={invitation} onChange={e => setInvitation(e.target.value)}/><button disabled={pending}>Accept invitation</button></form>
      <form className="panel" onSubmit={createCircle}><fieldset disabled={pending}><legend>Create a circle</legend><label htmlFor="new-circle-name">Circle name</label><input id="new-circle-name" required minLength={3} maxLength={80} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}/><label htmlFor="new-circle-description">Purpose and practice</label><textarea id="new-circle-description" required minLength={20} maxLength={1000} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })}/><label htmlFor="new-circle-visibility">Visibility</label><select id="new-circle-visibility" value={draft.visibility} onChange={e => setDraft({ ...draft, visibility: e.target.value as CircleDraft['visibility'] })}><option value="private">Private — invitation only</option><option value="discoverable">Discoverable — approval required</option></select><label className="toggle"><input type="checkbox" required checked={draft.rulesAccepted} onChange={e => setDraft({ ...draft, rulesAccepted: e.target.checked })}/> I will uphold privacy, consent and community rules</label><p className="muted">Creating a circle publishes its description according to visibility. Your private journal is never attached.</p><button type="submit">Create circle</button></fieldset></form>
    </>}
    <details className="panel"><summary>Privacy and account controls</summary><h3>Blocked accounts</h3>{blocks.length ? blocks.map(block => <p key={block.id}>{block.displayName} <button className="secondary" disabled={pending} onClick={() => void perform(async () => { await api.unblock(block.id); setBlocks((await api.blocks()).blocks); await reloadActive(); })}>Unblock</button></p>) : <p>No blocked accounts.</p>}<form onSubmit={e => { e.preventDefault(); if (window.confirm('Delete your community account permanently? Shared post text will be removed. Your device-local practice journal will remain.')) void perform(async () => { await api.deleteAccount(deletePassword); setUser(null); setActive(null); setCircles([]); setPosts([]); setMembers([]); setReports([]); setBlocks([]); setDeletePassword(''); setMessage('Community account deleted.'); }); }}><label htmlFor="delete-account-password">Confirm password to delete account</label><input id="delete-account-password" required minLength={12} type="password" autoComplete="current-password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)}/><p className="muted">Delete any circles you own first. Memberships, blocks and sessions are removed; shared posts become anonymous removal notices. Moderation records remain for safety.</p><button className="secondary" disabled={pending}>Delete community account</button></form></details>
    <h3>Paired sessions and experiments</h3><p className="muted">Not available in this release. Circle membership does not consent to pairing. No claims of scientifically established telepathy are made.</p>
  </section>;
}
