import {useEffect,useState} from "react";
/** Gentle optional visual target. The target is static unless the user chooses
 * a movement exercise and has not requested reduced motion. Natural blinking
 * and stopping for discomfort are always encouraged.
 */
export function VisualAttentionTarget({enabled,motionAllowed=true}:{enabled:boolean;motionAllowed?:boolean}){
 const [mode,setMode]=useState<"static"|"horizontal"|"vertical">("static");
 const [systemReduced,setSystemReduced]=useState(()=>typeof window!=="undefined" && typeof window.matchMedia==="function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
 const canMove=motionAllowed&&!systemReduced;
 useEffect(()=>{const media=window.matchMedia("(prefers-reduced-motion: reduce)");const changed=()=>setSystemReduced(media.matches);media.addEventListener("change",changed);return()=>media.removeEventListener("change",changed)},[]);
 useEffect(()=>{if(!canMove)setMode("static")},[canMove]);
 const effectiveMode=canMove?mode:"static";
 const [pace,setPace]=useState<"slow"|"gentle">("slow");
 return <section className="attention-training" aria-label="Visual attention target">
   <h3>Modern screen attention target</h3>
   <p className="notice">Screen movement and pace controls are modern additions, not Atkinson’s paper-target instructions.</p>
   <p className="muted">Follow comfortably if you choose movement. Blink naturally; stop if your eyes become tired. No need to stare.</p>
   <div className="attention-controls">
    <label htmlFor="attention-mode">Target motion</label>
    <select id="attention-mode" value={effectiveMode} disabled={!canMove} onChange={e=>setMode(e.target.value as typeof mode)}>
     <option value="static">Static dot</option><option value="horizontal">Slow horizontal tracking</option><option value="vertical">Slow vertical tracking</option>
    </select>
    <label htmlFor="attention-pace">Motion pace</label>
    <select id="attention-pace" value={pace} onChange={e=>setPace(e.target.value as typeof pace)} disabled={effectiveMode==="static"}>
     <option value="slow">Very slow</option><option value="gentle">Gentle</option>
    </select>
   </div>
   <div className={"attention-stage motion-"+effectiveMode+" pace-"+pace+(enabled?" playing":" paused")} aria-label={effectiveMode==="static"?"Stationary visual target":"Moving visual target, optional exercise"}>
    <div className="attention-dot"/>
   </div>
   <p className="muted">Motion requires your explicit selection; quiet mode and operating-system reduced motion keep the dot stationary.</p>
  </section>;
}

