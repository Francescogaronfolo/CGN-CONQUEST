import {COMUNI,LEGACY_SAN_COLOMBANO,SAN_COLOMBANO_SHIFT} from './data.js?v=1';
import {inside} from './geometry.js?v=1';
import {lotCenter,cellPoint} from './layout.js?v=1';
export function migrateCartography(g){if(g.cartography===1)return;const c=g.cities?.[101];if(c?.layout&&c.buildings?.some(b=>b.point?.[1]>55)){
 const original=LEGACY_SAN_COLOMBANO;
 const validate=(point,lot)=>{if(!lot||!Array.isArray(point)||!inside(point,original.polygons)||!point.every((v,i)=>Math.abs(v-(original.bounds[i]+(lot[i?'y':'x']+lot[i?'h':'w']/2)*lot.step))<1e-6))throw Error('Invalid legacy exclave parcel.');};
 for(const b of c.buildings){validate(b.point,b.lot);b.point=lotCenter(101,b.lot);}
 for(const p of g.projects||[])if(p.city===101&&p.type==='build'){validate(p.point,p.lot);p.point=lotCenter(101,p.lot);}
 for(const r of c.streets)r.path=r.cells.map(p=>cellPoint(101,c.layout.step,...p));
 if(c.plan){for(const s of c.plan.sites){validate(s.point,s.lot);s.point=lotCenter(101,s.lot);}for(const r of c.plan.roads)r.path=r.cells.map(p=>cellPoint(101,c.layout.step,...p));}
 for(const l of g.urbanLinks||[])if(l.kind==='air'){if(l.a===101)l.path[0]=l.path[0].map((v,i)=>v+SAN_COLOMBANO_SHIFT[i]);if(l.b===101)l.path[l.path.length-1]=l.path.at(-1).map((v,i)=>v+SAN_COLOMBANO_SHIFT[i]);}
 }g.cartography=1;}
