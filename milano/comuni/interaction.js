// Resolve targets by meaning, then proximity. Enlarged touch targets must not
// let a street laid underneath a building steal its selection.
const priority={building:0,site:1,frontier:2,company:2,link:3,plannedLink:3,street:4,planRoad:4};
export function pickTarget(hits,x,y,touch=false){
 const pad=touch?9:3;
 const candidates=hits.map((hit,index)=>{
  const box=hit.box;
  const distance=box?Math.hypot(Math.max(box[0]-x,0,x-box[2]),Math.max(box[1]-y,0,y-box[3])):Math.max(0,Math.hypot(hit.x-x,hit.y-y)-(hit.r||0));
  const center=box?Math.hypot((box[0]+box[2])/2-x,(box[1]+box[3])/2-y):Math.hypot(hit.x-x,hit.y-y);
  return {hit,index,distance,center};
 }).filter(c=>c.distance<=pad);
 candidates.sort((a,b)=>(a.distance===0?0:1)-(b.distance===0?0:1)||(priority[a.hit.kind]??5)-(priority[b.hit.kind]??5)||a.distance-b.distance||a.center-b.center||a.index-b.index);
 return candidates[0]?.hit;
}
export function panDecay(velocity,dt){
 const t=Math.max(0,Math.min(.05,dt)),decay=Math.exp(-9*t);
 return {move:velocity.map(v=>v*(1-decay)/9),velocity:velocity.map(v=>Math.abs(v*decay)<5?0:v*decay)};
}
export function relationship(g,other,me=0){
 if(other===me)return 'mine';
 if(g.treaties.some(t=>t.type==='coalition'&&t.until>g.time&&((t.a===me&&t.b===other)||(t.b===me&&t.a===other))))return 'ally';
 if(g.treaties.some(t=>t.type==='transit'&&t.until>g.time&&((t.a===me&&t.b===other)||(t.b===me&&t.a===other))))return 'trade';
 return 'rival';
}
export function pendingAlliance(g,other,me=0){return g.offers.find(o=>o.kind==='coalition'&&((o.from===me&&o.to===other)||(o.to===me&&o.from===other)));}
