import { useEffect, useId, useRef, useState } from 'react';
import { boundedPhase, demonstrationDurationMs, fingerExtension, movementCue, type MovementKind } from './movementDemo';

function HandDrawing({ kind, phase }: { kind: MovementKind; phase: number }) {
  const id = useId().replaceAll(':', '');
  const skin = `skin-${id}`, rim = `rim-${id}`, shadow = `shadow-${id}`, background = `background-${id}`;
  const angle = phase * Math.PI / 2;
  const tipX = 179 + Math.cos(angle) * 26;
  const tipY = 103 + Math.sin(angle) * 17;
  // Layered strokes form soft occlusion, a bronze body and a narrow key light.
  const digit = (path: string, width: number) => <g fill="none" strokeLinecap="round">
    <path d={path} stroke="#080f17" strokeOpacity=".45" strokeWidth={width + 4} transform="translate(2 3)"/>
    <path d={path} stroke={`url(#${skin})`} strokeWidth={width}/>
    <path d={path} stroke={`url(#${rim})`} strokeWidth={width - 5}/>
    <path d={path} stroke="#fff1d4" strokeOpacity=".22" strokeWidth="1.2" transform="translate(-4 -1)"/>
  </g>;
  const movingThumb = <g>{digit(`M128 194 C121 166 ${tipX - 24} ${tipY + 25} ${tipX} ${tipY}`, 25)}
    <ellipse cx={tipX} cy={tipY + 2} rx="6" ry="8" fill="#ead7b7" opacity=".65" transform={`rotate(-35 ${tipX} ${tipY + 2})`}/></g>;
  const steadyThumb = <g>{digit('M228 194 C224 148 193 120 176 106', 27)}<ellipse cx="176" cy="108" rx="6" ry="8" fill="#ead7b7" opacity=".55" transform="rotate(-38 176 108)"/></g>;
  return <svg viewBox="0 0 360 320" role="img" aria-label={kind === 'fingers' ? 'Simplified hand showing the selected finger movement' : 'Simplified hands showing one thumb circling the other'}>
    <defs>
      <linearGradient id={skin} x1="0" y1="0" x2="1" y2=".65"><stop stopColor="#8b674a"/><stop offset=".27" stopColor="#d6b88b"/><stop offset=".55" stopColor="#e9d3ac"/><stop offset=".82" stopColor="#b18a60"/><stop offset="1" stopColor="#68503e"/></linearGradient>
      <linearGradient id={rim} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff1cc" stopOpacity=".32"/><stop offset=".42" stopColor="#fff1cc" stopOpacity="0"/><stop offset="1" stopColor="#412d25" stopOpacity=".18"/></linearGradient>
      <radialGradient id={background}><stop stopColor="#567179" stopOpacity=".48"/><stop offset=".65" stopColor="#29434c" stopOpacity=".24"/><stop offset="1" stopColor="#101e2a" stopOpacity="0"/></radialGradient>
      <filter id={shadow} x="-35%" y="-30%" width="170%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>
    </defs>
    <ellipse cx="180" cy="150" rx="171" ry="151" fill={`url(#${background})`}/>
    <g fill="none" stroke="#c5ab80"><circle cx="180" cy="152" r="132" opacity=".09"/><circle cx="180" cy="152" r="121" opacity=".12" strokeDasharray="1 9"/>
      <path d="M37 152h13m260 0h13M180 8v12m0 264v12" opacity=".28"/>
      <circle cx="180" cy="152" r="132" strokeWidth="1.5" strokeDasharray={`${phase / (kind === 'fingers' ? 10 : 4) * 829.38} 829.38`} transform="rotate(-90 180 152)" opacity=".5"/>
    </g>
    <ellipse cx="184" cy="285" rx="72" ry="12" fill="#050b12" opacity=".7" filter={`url(#${shadow})`}/>
    {kind === 'fingers' ? <g>
      {[149, 177, 205, 231].map((x, index) => {
        const extension = fingerExtension(index + 1, phase);
        const y = 151 - extension * [78, 102, 87, 63][index]!;
        const width = index === 3 ? 18 : 22;
        const path = `M${x} 179 C${x - 9 * (1 - extension)} 150 ${x - 5} ${y + 18} ${x} ${y}`;
        return <g key={x}>{digit(path, width)}
          <path d={`M${x - 6} ${y + 19}q6 3 12 0M${x - 5} ${y + 36}q5 2 10 0`} fill="none" stroke="#74533f" strokeOpacity={extension * .45} strokeWidth="1.2"/>
          <ellipse cx={x} cy={y + 4} rx={width / 2 - 4} ry="8" fill="#f3dfbe" opacity={.06 + extension * .08}/>
        </g>;
      })}
      <path d="M131 153 Q114 156 117 187 L129 227 Q141 246 141 277 L212 277 Q211 249 224 226 Q240 201 235 169 Q233 153 217 153Z" fill={`url(#${skin})`} stroke="#f3dcaf" strokeOpacity=".24"/>
      <path d="M131 157Q120 183 140 219Q157 239 146 271L160 271Q168 235 144 207Q132 186 142 161Z" fill="#fff0ce" opacity=".12"/>
      <path d="M141 190Q165 180 210 187M143 216Q165 207 202 216M143 196Q147 216 161 226M150 254q22 5 49 0M149 258q24 5 49 0" fill="none" stroke="#6f513d" strokeOpacity=".38" strokeWidth="1.3" strokeLinecap="round"/>
      {digit(`M128 205 Q${119 - fingerExtension(0, phase) * 14} 170 ${191 - fingerExtension(0, phase) * 89} ${170 - fingerExtension(0, phase) * 27}`, 27)}
      <path d="M149 278h53" stroke="#e0c49d" strokeOpacity=".18"/>
    </g> : <g>
      <path d="M91 279L101 193Q102 169 126 170L192 195Q212 216 200 236L178 280Z" fill={`url(#${skin})`} stroke="#f3dcaf" strokeOpacity=".2"/>
      <path d="M269 279L257 191Q252 170 231 175L163 200Q145 215 158 239L183 280Z" fill={`url(#${skin})`} stroke="#f3dcaf" strokeOpacity=".2"/>
      {[0, 1, 2, 3].map(i => <g key={i}>{digit(`M${114 + i * 4} ${188 + i * 13} Q180 ${165 + i * 14} 229 ${190 + i * 13}`, 13)}
        <path d={`M170 ${180 + i * 13}l-2 7m27 -5l-1 7`} stroke="#6f513d" strokeOpacity=".45" fill="none"/></g>)}
      <ellipse cx="179" cy="103" rx="27" ry="18" fill="none" stroke="#dbc196" strokeDasharray="1 5" strokeOpacity=".3"/>
      {Math.sin(angle) < 0 ? <>{movingThumb}{steadyThumb}</> : <>{steadyThumb}{movingThumb}</>}
      <path d="M110 255l43 12m60 -1l39 -12" stroke="#6f513d" strokeOpacity=".35" fill="none"/>
    </g>}
    <g fill="#d1b990" opacity=".6" fontFamily="monospace" fontSize="8" letterSpacing="2"><text x="31" y="310">{kind === 'fingers' ? 'UNFOLD / RETURN' : 'CIRCULAR MOTION'}</text><text x="281" y="310">STUDY {kind === 'fingers' ? '01' : '02'}</text></g>
  </svg>;
}

export function MovementDemonstration({ kind, motionAllowed, available }: { kind: MovementKind; motionAllowed: boolean; available: boolean }) {
  const [systemReduced, setSystemReduced] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [requested, setRequested] = useState(false);
  const [phase, setPhase] = useState(0);
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  const currentPhase = useRef(phase);
  const rangeId = useId();
  const speedId = useId();
  const [rate, setRate] = useState(1);
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
    const duration = demonstrationDurationMs / rate;
    const start = performance.now() - currentPhase.current / max * duration;
    const tick = (now: number) => {
      const next = boundedPhase((now - start) / duration * max, kind);
      if (now - lastPaint >= 16 || next === max) { currentPhase.current = next; setPhase(next); lastPaint = now; }
      if (next >= max) setRequested(false); else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [playing, kind, max, rate]);
  const label = movementCue(kind, phase);
  function select(value: number) { setRequested(false); const next = boundedPhase(value, kind); currentPhase.current = next; setPhase(next); }
  return <section className="movement-demo" aria-label="Optional movement demonstration" data-playing={playing ? 'true' : 'false'} data-phase={phase.toFixed(2)}>
    <div className="demo-heading"><div><p className="eyebrow">MOVEMENT STUDY</p><h3>{kind === 'fingers' ? 'Unfold. Return.' : 'A gentle circle.'}</h3></div><span className="demo-badge">Optional</span></div>
    <div className="demo-stage"><div className="movement-drawing"><HandDrawing kind={kind} phase={phase}/></div></div>
    <p className="demo-caption">{label}</p>
    <div className="actions"><button type="button" disabled={!allowed} onClick={() => { if (requested) setRequested(false); else { if (phase >= max) { currentPhase.current = 0; setPhase(0); } setRequested(true); } }}>{playing ? 'Pause demonstration' : phase >= max ? 'Replay demonstration' : 'Play demonstration'}</button><button className="secondary" type="button" onClick={() => select(0)}>Reset illustration</button></div>
    <div className="demo-pace"><label htmlFor={speedId}>Demonstration pace</label><select id={speedId} value={rate} onChange={e => { setRequested(false); setRate(Number(e.target.value)); }}><option value="1">Standard · 18 seconds</option><option value="0.5">Slow · 36 seconds</option></select></div>
    <label htmlFor={rangeId}>Choose a still frame</label><input id={rangeId} type="range" min="0" max={max} step="1" aria-valuetext={label} value={Math.floor(phase)} onChange={e => select(Number(e.target.value))}/>
    <p className="muted">Modern visual aid: a stylized movement study, not an anatomical model. Move only within your comfortable range. The demonstration is separate from your practice timer.</p>
    {!available ? <p className="muted">Demonstration motion stops when practice starts; still frames remain available.</p> : (!motionAllowed || systemReduced) && <p className="muted">Motion is off in Quiet Mode or with reduced motion. Still frames remain available. Quiet Mode can be changed in Profile.</p>}
  </section>;
}
