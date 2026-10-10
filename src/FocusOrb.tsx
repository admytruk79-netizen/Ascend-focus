type Props={progress:number;running:boolean};
export function FocusOrb({progress,running}:Props){
 const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));
 return <div className={"focus-orb"+(running?" is-active":"")} role="img" aria-label={`Practice progress ${Math.round(p*100)} percent`}>
  <svg viewBox="0 0 160 160" aria-hidden="true" focusable="false">
   <circle className="orb-track" cx="80" cy="80" r="64"/>
   <circle className="orb-progress" cx="80" cy="80" r="64" pathLength="1" strokeDasharray="1" strokeDashoffset={1-p}/>
   <circle className="orb-halo" cx="80" cy="80" r="41"/>
   <circle className="orb-core" cx="80" cy="80" r="24"/>
   <circle className="orb-point" cx="80" cy="80" r="4"/>
  </svg>
 </div>;
}
