import {COMUNI} from './data.js?v=1';
import {inside} from './geometry.js?v=1';
import {cellKey,lotCells,cellPoint} from './layout.js?v=1';
const fabricCache=new WeakMap(),pathCache=new WeakMap();
// Original schematic urban fabric. Passive footprints provide cartographic
// context; productive sites remain separate, protected and clickable.
export function urbanFabric(id,plan){if(fabricCache.has(plan))return fabricCache.get(plan);const town=COMUNI[id],step=plan.layout.step,roads=new Set(plan.roads.flatMap(r=>r.cells.map(p=>cellKey(...p)))),reserved=new Set(plan.sites.flatMap(s=>lotCells(s.lot).map(p=>cellKey(...p)))),cells=plan.roads.flatMap(r=>r.cells),xs=cells.map(p=>p[0]),ys=cells.map(p=>p[1]),minX=Math.min(...xs)-7,maxX=Math.max(...xs)+7,minY=Math.min(...ys)-7,maxY=Math.max(...ys)+7,minor=new Set(),footprints=[],parks=[],trees=[],segments=[];
 const center=(x,y)=>cellPoint(id,step,x,y),valid=(x,y)=>inside(center(x,y),town.polygons),hash=(x,y)=>Math.abs(Math.imul(x+id*17,73856093)^Math.imul(y+3,19349663));
 for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const key=cellKey(x,y);if(reserved.has(key)||roads.has(key)||!valid(x,y))continue;if(((x-plan.layout.entry[0])%7+7)%7===0||((y-plan.layout.entry[1])%6+6)%6===0)minor.add(key);}
 const all=new Set([...roads,...minor]);
 for(const key of minor){const [x,y]=key.split(':').map(Number),a=center(x,y);for(const [dx,dy]of [[1,0],[0,1],[-1,0],[0,-1]])if(all.has(cellKey(x+dx,y+dy)))segments.push([a,center(x+dx,y+dy)]);}
 for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const key=cellKey(x,y);if(reserved.has(key)||all.has(key)||!valid(x,y))continue;const [cx,cy]=center(x,y),n=hash(x,y),nearRoad=[[1,0],[-1,0],[0,1],[0,-1],[2,0],[-2,0],[0,2],[0,-2]].some(([dx,dy])=>all.has(cellKey(x+dx,y+dy)));if(!nearRoad)continue;
  if((Math.floor((x-minX)/3)+Math.floor((y-minY)/3)*7+id)%17===0){parks.push([cx-step*.47,cy-step*.47,step*.94,step*.94]);trees.push([cx-step*.2,cy-step*.18,step*.09],[cx+step*.23,cy+step*.19,step*.08]);continue;}
  const inset=step*(.12+(n%3)*.025),left=cx-step*.5+inset,top=cy-step*.5+inset,w=step-inset*2,h=step-inset*2;if(n%4===0){footprints.push([left,top,w,h*.32],[left,top+h*.6,w,h*.4]);}else if(n%4===1){footprints.push([left,top,w*.4,h],[left+w*.62,top,w*.38,h]);}else{footprints.push([left,top,w,h]);}if(n%3===0)trees.push([cx-step*.39,cy+step*.4,step*.055]);
 }
 const value={step,reserved,minor,segments,footprints,parks,trees};fabricCache.set(plan,value);return value;
}
export function paintUrbanFabric(ctx,projection,id,plan){if(typeof Path2D==='undefined')return;let paths=pathCache.get(plan);const f=urbanFabric(id,plan);if(!paths){paths={roads:new Path2D(),buildings:new Path2D(),parks:new Path2D(),trees:new Path2D()};for(const [a,b]of f.segments){paths.roads.moveTo(...a);paths.roads.lineTo(...b);}for(const r of f.footprints)paths.buildings.rect(...r);for(const r of f.parks)paths.parks.rect(...r);for(const [x,y,r]of f.trees){paths.trees.moveTo(x+r,y);paths.trees.arc(x,y,r,0,Math.PI*2);}pathCache.set(plan,paths);}
 ctx.save();ctx.translate(projection.x,projection.y);ctx.scale(projection.scale,projection.scale);ctx.fillStyle='#d7e8d3';ctx.fill(paths.parks);ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='#d1d9db';ctx.lineWidth=f.step*.32;ctx.stroke(paths.roads);ctx.strokeStyle='#ffffff';ctx.lineWidth=f.step*.23;ctx.stroke(paths.roads);ctx.fillStyle='#e1e3de';ctx.fill(paths.buildings);ctx.strokeStyle='#cbd0ca';ctx.lineWidth=.65/projection.scale;ctx.stroke(paths.buildings);ctx.fillStyle='#a9c9a4';ctx.fill(paths.trees);ctx.restore();
}
