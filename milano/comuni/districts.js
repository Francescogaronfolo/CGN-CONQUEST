import {COMUNI} from './data.js?v=1';
import {segmentInside} from './geometry.js?v=1';
import {gridStep,lotAt,lotCenter,lotCells,cellPoint} from './layout.js?v=1';
export {segmentInside};
export const districtUnit=gridStep;
const plans=new WeakMap();
export function districtPlan(cityId,b){const lot=b.lot||lotAt(cityId,gridStep(cityId),b.type,b.point,b.rotation||0),key=cityId+':'+b.level+':'+b.type+':'+b.id+':'+JSON.stringify(lot),cached=plans.get(b);if(cached?.key===key)return cached.plan;const center=lotCenter(cityId,lot),plan={lot,unit:lot.step,step:lot.step,center,lots:lotCells(lot).map(([x,y])=>({point:cellPoint(cityId,lot.step,x,y),x:x-lot.x,y:y-lot.y,size:lot.step*.85,variant:(b.id+x*3+y*7+9999)%5})),radius:Math.hypot(lot.w,lot.h)*lot.step/2};plans.set(b,{key,plan});return plan;}
export const pathInside=(cityId,points)=>points.every((p,i)=>!i||segmentInside(points[i-1],p,COMUNI[cityId].polygons));
export function streetPath(cityId,a,b){if(!Array.isArray(a)||!Array.isArray(b)||a.length!==2||b.length!==2||![...a,...b].every(Number.isFinite)||Math.hypot(a[0]-b[0],a[1]-b[1])<.04)return null;for(const points of [[a,[b[0],a[1]],b],[a,[a[0],b[1]],b],[a,b]])if(pathInside(cityId,points))return points.filter((p,i)=>!i||Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1])>.00001);return null;}
export const streetLength=path=>path.slice(1).reduce((n,p,i)=>n+Math.hypot(p[0]-path[i][0],p[1]-path[i][1]),0);
