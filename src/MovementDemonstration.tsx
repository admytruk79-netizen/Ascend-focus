import { useEffect, useId, useRef, useState } from 'react';
import { boundedPhase, demonstrationDurationMs, fingerExtension, fingerPose, fingerOutline, movementCue, type MovementKind } from './movementDemo';

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
  const sculptedDigit = (points: ReturnType<typeof fingerPose>, prefix: string) => <g>
    <path d={fingerOutline(points)} fill="#050d16" opacity=".24" transform="translate(2 3)"/>
    <path d={fingerOutline(points)} fill={`url(#${skin})`} stroke="#ead1a9" strokeOpacity=".12" strokeWidth=".65"/>
    <path d={fingerOutline(points)} fill={`url(#${rim})`}/>
    {points.slice(1, 3).map((point, index) => <path key={`${prefix}-crease-${index}`} d={`M${point.x - point.radius * .65} ${point.y + 1}q${point.radius * .65} 2 ${point.radius * 1.3} 0m-${point.radius * 1.1} 3q${point.radius * .5} 1 ${point.radius} 0`} stroke="#634936" strokeOpacity=".2" strokeWidth=".75" fill="none"/>)}
  </g>;
  const movingThumbPoints = [{ x: 128, y: 197, depth: 0, radius: 15 }, { x: 139, y: 153, depth: 0, radius: 13 }, { x: tipX - 13, y: tipY + 21, depth: 0, radius: 11 }, { x: tipX, y: tipY, depth: 0, radius: 9 }];
  const steadyThumbPoints = [{ x: 230, y: 197, depth: 0, radius: 15 }, { x: 212, y: 149, depth: 0, radius: 13 }, { x: 190, y: 123, depth: 0, radius: 11 }, { x: 176, y: 106, depth: 0, radius: 9 }];
  const movingThumb = sculptedDigit(movingThumbPoints, 'moving-thumb');
  const steadyThumb = sculptedDigit(steadyThumbPoints, 'steady-thumb');
  const fingers = [0, 1, 2, 3].map(index => ({ index, points: fingerPose(index, phase), extension: fingerExtension(index + 1, phase) }));
  const activeFinger = phase > 0 && phase < 10 ? (phase <= 5 ? Math.ceil(phase) - 1 : 10 - Math.ceil(phase)) : -1;
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
    {kind === 'fingers' ? <g transform="matrix(.985 -.09 .09 .985 -10 15)">
      {fingers.map(({ index, points }) => <g key={index}>{sculptedDigit(points, `finger-${index}`)}</g>)}
      <path d="M135 159 Q126 155 122 172 Q114 191 129 223 Q140 243 138 277 L208 277 Q208 247 223 222 Q238 198 235 172 Q234 155 223 158 Q211 152 202 158 Q188 151 174 158 Q151 151 135 159Z" fill={`url(#${skin})`} stroke="#efd6ae" strokeOpacity=".2" strokeWidth=".8"/>
      <path d="M133 172Q118 194 141 224Q157 239 148 268L159 268Q172 239 148 213Q135 193 144 177Z" fill="#fff0ce" opacity=".08"/>
      <path d="M140 189C162 180 182 185 211 182M145 213C162 206 184 205 205 213M139 197C142 212 149 225 161 230M148 254q26 4 49 0m-48 4q25 4 48 0" fill="none" stroke="#674b38" strokeOpacity=".3" strokeWidth="1.15" strokeLinecap="round"/>
      <path d="M155 181q9 -3 17 0m7 1q13 -3 21 0" fill="none" stroke="#ffedc9" strokeOpacity=".18" strokeWidth="1"/>
      {fingers.filter(finger => finger.extension < .85).map(({ index, points, extension }) => <g key={`curl-${index}`} opacity={Math.min(1, (1 - extension) * 4)}>{sculptedDigit(points.slice(1), `curl-${index}`)}</g>)}
      {sculptedDigit([
        { x: 137, y: 222, depth: 0, radius: 17 },
        { x: 128 - fingerExtension(0, phase) * 12, y: 191, depth: 0, radius: 14 },
        { x: 143 - fingerExtension(0, phase) * 34, y: 170 - fingerExtension(0, phase) * 10, depth: 0, radius: 11 },
        { x: 180 - fingerExtension(0, phase) * 81, y: 165 - fingerExtension(0, phase) * 27, depth: 0, radius: 9 },
      ], 'thumb')}
      {activeFinger > 0 && <g fill="none" stroke="#fff0ca" strokeWidth="1" opacity=".5"><circle cx={fingers[activeFinger - 1]!.points[3]!.x} cy={fingers[activeFinger - 1]!.points[3]!.y} r="13"/></g>}
    </g> : <g>
      <path d="M94 279L103 212Q96 192 108 177Q117 165 133 177L192 202Q210 219 196 237L177 279Z" fill={`url(#${skin})`} stroke="#f3dcaf" strokeOpacity=".2"/>
      <path d="M267 279L256 211Q261 188 249 177Q238 169 225 179L169 206Q150 220 164 241L184 279Z" fill={`url(#${skin})`} stroke="#f3dcaf" strokeOpacity=".2"/>
      {[0, 1, 2, 3].map(i => <g key={i}>{digit(`M${112 + i * 4} ${189 + i * 13} C${143 + i * 3} ${171 + i * 14} ${193 - i * 2} ${173 + i * 13} ${235 - i * 4} ${192 + i * 13}`, 13)}
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
    <div className="demo-pace"><label htmlFor={speedId}>Demonstration pace</label><select id={speedId} value={rate} onChange={e => { setRequested(false); setRate(Number(e.target.value)); }}><option value="1">Standard · 18s</option><option value="0.5">Slow · 36s</option></select></div>
    <label htmlFor={rangeId}>Choose a still frame</label><input id={rangeId} type="range" min="0" max={max} step="1" aria-valuetext={label} value={Math.floor(phase)} onChange={e => select(Number(e.target.value))}/>
    <p className="muted">Modern visual aid: a stylized movement study, not an anatomical model. Move only within your comfortable range. The demonstration is separate from your practice timer.</p>
    {!available ? <p className="muted">Demonstration motion stops when practice starts; still frames remain available.</p> : (!motionAllowed || systemReduced) && <p className="muted">Motion is off in Quiet Mode or with reduced motion. Still frames remain available. Quiet Mode can be changed in Profile.</p>}
  </section>;
}
