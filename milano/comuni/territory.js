import {COMUNI} from './data.js?v=1';
// One shared topological edge, irrespective of the municipality that contains it.
const table=new Map();
for(const town of COMUNI)for(const poly of town.polygons)for(const ring of poly)for(let i=1;i<ring.length;i++){
 const a=ring[i-1],b=ring[i],key=[a.join(','),b.join(',')].sort().join('|');
 if(!table.has(key))table.set(key,{a,b,towns:[]});
 const e=table.get(key);if(!e.towns.includes(town.id))e.towns.push(town.id);
}
export const BORDERS=[...table.values()];
export function visibleBorders(cities){return BORDERS.filter(e=>e.towns.length===1||cities[e.towns[0]].owner===null||cities[e.towns[1]].owner===null||cities[e.towns[0]].owner!==cities[e.towns[1]].owner);}
export function companyGeometry(cities){const groups=new Map();for(const city of cities){if(city.owner===null)continue;if(!groups.has(city.owner))groups.set(city.owner,[]);groups.get(city.owner).push(COMUNI[city.id]);}return groups;}

// Administrative names survive; the playable region follows contiguous ownership.
export function connectedTerritory(cities,start){if(!COMUNI[start])return[];const owner=cities[start].owner;if(owner===null)return[start];const found=new Set([start]),queue=[start];for(let i=0;i<queue.length;i++)for(const next of COMUNI[queue[i]].neighbors)if(cities[next].owner===owner&&!found.has(next)){found.add(next);queue.push(next);}return [...found].sort((a,b)=>a-b);}
export function territoryBounds(ids){return ids.reduce((b,id)=>{const t=COMUNI[id].bounds;return[Math.min(b[0],t[0]),Math.min(b[1],t[1]),Math.max(b[2],t[2]),Math.max(b[3],t[3])];},[Infinity,Infinity,-Infinity,-Infinity]);}
export function territoryBorders(ids){const selected=new Set(ids);return BORDERS.filter(edge=>edge.towns.filter(id=>selected.has(id)).length===1);}
