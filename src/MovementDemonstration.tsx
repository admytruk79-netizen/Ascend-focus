import { useEffect, useId, useRef, useState } from 'react';
import { boundedPhase, demonstrationDurationMs, fingerExtension, fingerFrames, type MovementKind } from './movementDemo';

function HandDrawing({ kind, phase }: { kind: MovementKind; phase: number }) {
  const id = useId().replaceAll(':', '');
  const skin = `skin-${id}`, glow = `glow-${id}`, background = `background-${id}`;
  const tipX = 179 + Math.cos(phase * Math.PI / 2) * 22;
  const tipY = 100 + Math.sin(phase * Math.PI / 2) * 13;
  const movingThumb = <path d={`M 128 192 C 125 162 ${tipX - 24} ${tipY + 24} ${tipX} ${tipY}`} stroke={`url(#${skin})`} strokeWidth="25" strokeLinecap="round" fill="none"/>;
  const steadyThumb = <path d="M 228 190 C 224 147 192 117 173 102" stroke="#cbb491" strokeWidth="26" strokeLinecap="round" fill="none"/>;
  return <svg viewBox="0 0 360 300" role="img" aria-label={kind === 'fingers' ? 'Simplified hand showing the selected finger movement' : 'Simplified hands showing one thumb circling the other'}>
    <defs>
      <linearGradient id={skin} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#f2dfbd"/><stop offset=".5" stopColor="#c6a375"/><stop offset="1" stopColor="#84694d"/></linearGradient>
      <radialGradient id={background}><stop stopColor="#37505a" stopOpacity=".45"/><stop offset="1" stopColor="#132432" stopOpacity="0"/></radialGradient>
      <filter id={glow} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.5"/></filter>
    </defs>
    <ellipse cx="180" cy="157" rx="155" ry="136" fill={`url(#${background})`}/>
    <g fill="none" stroke="#b99c72" opacity=".18"><circle cx="180" cy="150" r="121"/><path d="M38 150h12m260 0h12M180 17v12m0 242v12"/></g>
    {kind === 'fingers' ? <g>
      {[150, 178, 206, 231].map((x, index) => {
        const extension = fingerExtension(index + 1, phase);
        const y = 153 - extension * [77, 101, 86, 61][index]!;
        return <g key={x}><path d={`M${x} 175 C${x - 10} 151 ${x - 6} ${y + 15} ${x} ${y}`} fill="none" stroke={`url(#${skin})`} strokeWidth={index === 3 ? 18 : 22} strokeLinecap="round"/><path d={`M${x - 5} ${y + 7}l8 -1`} stroke="#ffefcf" opacity=".3" strokeLinecap="round"/></g>;
      })}
      <path d="M130 151 Q113 157 118 187 L130 227 Q142 246 142 274 L211 274 Q212 248 224 226 Q238 203 236 169 Q234 153 218 153Z" fill={`url(#${skin})`} stroke="#f3dcaf" strokeOpacity=".32" strokeWidth="1.5"/>
      <path d="M140 193Q162 180 208 186M142 218Q171 207 204 216M150 253h51" fill="none" stroke="#6f573f" strokeOpacity=".4" strokeWidth="1.8"/>
      <path d={`M128 204 Q${119 - fingerExtension(0, phase) * 14} 170 ${191 - fingerExtension(0, phase) * 89} ${170 - fingerExtension(0, phase) * 27}`} stroke={`url(#${skin})`} strokeWidth="27" strokeLinecap="round" fill="none"/>
      <path d="M151 274h50" stroke="#e0c49d" strokeOpacity=".2" strokeWidth="2"/>
    </g> : <g>
      <path d="M91 268L101 193Q102 169 126 170L192 195Q212 216 200 236L178 270Z" fill={`url(#${skin})`} stroke="#f3dcaf" strokeOpacity=".2"/>
      <path d="M269 268L257 191Q252 170 231 175L163 200Q145 215 158 239L183 270Z" fill="#b59973" stroke="#f3dcaf" strokeOpacity=".2"/>
      {[0, 1, 2, 3].map(i => <g key={i}><path d={`M${114 + i * 4} ${188 + i * 13} Q180 ${165 + i * 14} 229 ${190 + i * 13}`} fill="none" stroke={i % 2 ? '#aa8a63' : '#d7bc93'} strokeWidth="12" strokeLinecap="round"/><path d={`M${121 + i * 4} ${187 + i * 13}Q176 ${180 + i * 13} 214 ${190 + i * 13}`} fill="none" stroke="#ead5b3" strokeOpacity=".2"/></g>)}
      <ellipse cx="179" cy="100" rx="23" ry="14" fill="none" stroke="#dbc196" strokeDasharray="2 7" strokeOpacity=".35"/>
      {Math.sin(phase * Math.PI / 2) < 0 ? <>{movingThumb}{steadyThumb}</> : <>{steadyThumb}{movingThumb}</>}
      <circle cx={tipX} cy={tipY} r="6" fill="#f4dfb9" opacity=".35" filter={`url(#${glow})`}/>
    </g>}
    <path d="M73 285h214" stroke="#dbc196" opacity=".15"/>
  </svg>;
}

export function MovementDemonstration({ kind, motionAllowed, available }: { kind: MovementKind; motionAllowed: boolean; available: boolean }) {
  const [systemReduced, setSystemReduced] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [requested, setRequested] = useState(false);
  const [phase, setPhase] = useState(0);
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  const currentPhase = useRef(phase);
  const rangeId = useId();
  const max = kind === 'fingers' ? 10 : 4;
  const allowed = motionAllowed && !systemReduced && available && !hidden;
  const playing = requested && allowed;
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const changed = () => { setSystemReduced(media.matches); setRequested(false); };
    media.addEventListener('change', changed); return () => media.removeEventListener('change', changed);
  }, []);
  useEffect(() => {
    const changed = () => { setHidden(document.hidden); if (document.hidden) setRequested(false); };
    document.addEventListener('visibilitychange', changed); return () => document.removeEventListener('visibilitychange', changed);
  }, []);
  useEffect(() => { if (!allowed) setRequested(false); }, [allowed]);
  useEffect(() => {
    if (!playing) return;
    let frame = 0, lastPaint = 0;
    const start = performance.now() - currentPhase.current / max * demonstrationDurationMs;
    const tick = (now: number) => {
      const next = boundedPhase((now - start) / demonstrationDurationMs * max, kind);
      if (now - lastPaint >= 30 || next === max) { currentPhase.current = next; setPhase(next); lastPaint = now; }
      if (next >= max) setRequested(false); else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [playing, kind, max]);
  const label = kind === 'fingers' ? fingerFrames[Math.min(10, Math.floor(phase))] : 'Circle one thumb gently around the other';
  function select(value: number) { setRequested(false); const next = boundedPhase(value, kind); currentPhase.current = next; setPhase(next); }
  return <section className="movement-demo" aria-label="Optional movement demonstration" data-playing={playing ? 'true' : 'false'} data-phase={phase.toFixed(2)}>
    <div className="demo-heading"><div><p className="eyebrow">MOVEMENT STUDY</p><h3>{kind === 'fingers' ? 'Unfold. Return.' : 'A gentle circle.'}</h3></div><span className="demo-badge">Optional</span></div>
    <div className="movement-drawing"><HandDrawing kind={kind} phase={phase}/></div>
    <p className="demo-caption">{label}</p>
    <div className="actions"><button type="button" disabled={!allowed} onClick={() => { if (requested) setRequested(false); else { if (phase >= max) { currentPhase.current = 0; setPhase(0); } setRequested(true); } }}>{playing ? 'Pause demonstration' : phase >= max ? 'Replay demonstration' : 'Play demonstration'}</button><button className="secondary" type="button" onClick={() => select(0)}>Reset illustration</button></div>
    <label htmlFor={rangeId}>Choose a still frame</label><input id={rangeId} type="range" min="0" max={max} step="1" value={Math.floor(phase)} onChange={e => select(Number(e.target.value))}/>
    <p className="muted">Modern visual aid: a simplified movement sketch. Move only within your comfortable range. The demonstration is separate from your practice timer.</p>
    {!available ? <p className="muted">Demonstration motion stops when practice starts; still frames remain available.</p> : (!motionAllowed || systemReduced) && <p className="muted">Motion is off in Quiet Mode or with reduced motion. Still frames remain available. Quiet Mode can be changed in Profile.</p>}
  </section>;
}
