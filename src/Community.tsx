import { useEffect, useState, type FormEvent } from 'react';
import { ConnectedCommunity } from './ConnectedCommunity';
import { communityApi } from './communityApi';
import { offlineCommunity, readCircleDraft, validateCircle, type CircleDraft, type CommunityService } from './community';

const draftKey = 'ascend-focus-circle-draft-v1';
const emptyDraft: CircleDraft = { name: '', description: '', visibility: 'private', rulesAccepted: false };
function loadDraft(): CircleDraft {
  try { return readCircleDraft(localStorage.getItem(draftKey)) ?? emptyDraft; } catch { return emptyDraft; }
}

function OfflineCommunity({ service = offlineCommunity }: { service?: CommunityService }) {
  const [draft, setDraft] = useState<CircleDraft>(loadDraft);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const offline = service.status === 'offline';
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const error = validateCircle(draft);
    if (error) { setMessage(error); return; }
    setPending(true);
    try {
      const normalized = { ...draft, name: draft.name.trim(), description: draft.description.trim() };
      if (offline) {
        localStorage.setItem(draftKey, JSON.stringify(normalized));
        setMessage('Draft saved on this device. No circle was published and no invitations were sent.');
      } else {
        const circle = await service.createCircle(normalized);
        setMessage(`Circle created: ${circle.name}.`);
        setDraft(emptyDraft);
      }
    } catch { setMessage(offline ? 'Could not save your draft. Browser storage may be unavailable. Your text is still here.' : 'Circle creation failed. Your text is still here; try again.'); }
    finally { setPending(false); }
  }
  function deleteDraft() {
    try { localStorage.removeItem(draftKey); setDraft(emptyDraft); setMessage('Local draft deleted.'); }
    catch { setMessage('Could not delete the saved draft.'); }
  }
  return <section aria-labelledby="community-heading">
    <p className="eyebrow">PRACTICE TOGETHER</p><h2 id="community-heading">Community</h2>
    <p className="notice">{offline ? 'Offline — no authentication or community server is connected. Circle creation below saves a local draft only.' : 'Connected community. Publication is separate from your private practice journal.'}</p>
    <h3>{offline ? 'Prepare your circle' : 'Create a circle'}</h3>
    <p className="muted">A circle is a voluntary group for discussion and shared practice. Your journal is never attached automatically.</p>
    <form className="panel" onSubmit={submit}>
      <label htmlFor="circle-name">Circle name</label>
      <input id="circle-name" value={draft.name} maxLength={80} required minLength={3} onChange={e => setDraft({ ...draft, name: e.target.value })}/>
      <label htmlFor="circle-description">Purpose and practice</label>
      <textarea id="circle-description" value={draft.description} minLength={20} maxLength={1000} required rows={4} onChange={e => setDraft({ ...draft, description: e.target.value })}/>
      <label htmlFor="circle-visibility">Visibility</label>
      <select id="circle-visibility" value={draft.visibility} onChange={e => setDraft({ ...draft, visibility: e.target.value as CircleDraft['visibility'] })}>
        <option value="private">Private — invitation only</option><option value="discoverable">Discoverable — listed, membership approval required</option>
      </select>
      <p className="muted">Discussions are restricted to approved members in either mode. Visibility takes effect only after publication to a connected server.</p>
      <p id="circle-rules">Respect consent and privacy. No harassment, coercion, targeting strangers, or claims of covert influence. Historical telepathy claims are not established scientific facts. Paired practice requires each participant’s explicit agreement.</p>
      <label className="toggle"><input type="checkbox" checked={draft.rulesAccepted} onChange={e => setDraft({ ...draft, rulesAccepted: e.target.checked })} aria-describedby="circle-rules"/> I agree to the community rules</label>
      <div className="actions"><button disabled={pending} type="submit">{pending ? 'Saving…' : offline ? 'Save local circle draft' : 'Create circle'}</button><button type="button" className="secondary" onClick={deleteDraft} disabled={pending}>Delete local draft</button></div>
      <p role="status" aria-live="polite">{message}</p>
    </form>
    <h3>Sessions and experiments</h3><p className="muted">Unavailable until accounts, moderation, reporting and server permissions are deployed. No partner matching or messages are active.</p>
  </section>;
}

export function Community() {
  const [connection, setConnection] = useState<'checking' | 'offline' | 'connected'>('checking');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let mounted = true;
    setConnection('checking');
    communityApi.health().then(result => {
      if (mounted) setConnection(result.status === 'connected' && result.service === 'ascend-focus-community' && result.version === 1 ? 'connected' : 'offline');
    }).catch(() => { if (mounted) setConnection('offline'); });
    return () => { mounted = false; };
  }, [attempt]);
  if (connection === 'checking') return <p role="status">Checking the community server…</p>;
  if (connection === 'connected') return <ConnectedCommunity/>;
  return <><OfflineCommunity/><button className="secondary" onClick={() => setAttempt(value => value + 1)}>Retry community connection</button></>;
}
