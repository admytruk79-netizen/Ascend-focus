import {useState} from "react";
type Props={steps:string[];exerciseId:string};
export function GuidedSteps({steps,exerciseId}:Props){
 const [position,setPosition]=useState(0);
 const [seen,setSeen]=useState<Record<string,number>>({});
 const current=Math.min(seen[exerciseId]??0,Math.max(0,steps.length-1));
 function navigate(next:number){setSeen(prev=>({...prev,[exerciseId]:Math.max(0,Math.min(steps.length-1,next))}));setPosition(next)}
 // position is intentionally used as a navigation signal for screen-reader announcements.
 void position;
 return <div className="guided-steps" aria-label="Guided exercise instructions">
  <p className="eyebrow">STEP {current+1} OF {steps.length}</p>
  <progress value={current+1} max={steps.length} aria-label="Instruction progress"/>
  <p key={current} className="guided-instruction" aria-live="polite" aria-atomic="true">{steps[current]}</p>
  <div className="actions">
   <button type="button" className="secondary" disabled={current===0} onClick={()=>navigate(current-1)}>Previous</button>
   <button type="button" disabled={current===steps.length-1} onClick={()=>navigate(current+1)}>Next step</button>
  </div>
  <p className="muted">Move between steps at your own pace. You can pause or finish your session at any time.</p>
 </div>;
}
