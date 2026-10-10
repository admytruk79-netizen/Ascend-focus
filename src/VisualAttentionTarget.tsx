import {useState} from "react";
/** Gentle optional visual target. The target is static unless the user chooses
 * a movement exercise and has not requested reduced motion. Natural blinking
 * and stopping for discomfort are always encouraged.
 */
export function VisualAttentionTarget({enabled}:{enabled:boolean}){
 const [mode,setMode]=useState<"static"|"horizontal"|"vertical">("static");
 const [pace,setPace]=useState<"slow"|"gentle">("slow");
 return <section className="attention-training" aria-label="Visual attention target">
   <h3>Attention target</h3>
   <p className="muted">Follow comfortably if you choose movement. Blink naturally; stop if your eyes become tired. No need to stare.</p>
   <div className="attention-controls">
    <label htmlFor="attention-mode">Target motion</label>
    <select id="attention-mode" value={mode} onChange={e=>setMode(e.target.value as typeof mode)}>
     <option value="static">Static dot</option><option value="horizontal">Slow horizontal tracking</option><option value="vertical">Slow vertical tracking</option>
    </select>
    <label htmlFor="attention-pace">Motion pace</label>
    <select id="attention-pace" value={pace} onChange={e=>setPace(e.target.value as typeof pace)} disabled={mode==="static"}>
     <option value="slow">Very slow</option><option value="gentle">Gentle</option>
    </select>
   </div>
   <div className={"attention-stage motion-"+mode+" pace-"+pace+(enabled?" playing":" paused")} aria-label={mode==="static"?"Stationary visual target":"Moving visual target, optional exercise"}>
    <div className="attention-dot"/>
   </div>
   <p className="muted">Movement is decorative only when selected; reduced-motion settings keep the dot stationary.</p>
  </section>;
}
