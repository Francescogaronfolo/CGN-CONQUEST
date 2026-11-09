import test from 'node:test';
import assert from 'node:assert/strict';
import {SITES,PUBLIC_SITES,CANAL,MAX_LEVEL,START_CASH,createState,income,quote,invest,step,restore,walkable,findPath} from '../mondo/model.js';
test('Every business can be reached from home without walking through a building',()=>{
 for(const site of SITES){const route=findPath([-4,6],site.door);assert(route.length,site.name);assert(route.every(([x,z])=>walkable(x,z)),site.name);assert(Math.hypot(route.at(-1)[0]-site.door[0],route.at(-1)[1]-site.door[1])<2);}
});
test('Buying is immediately productive, each upgrade raises income, maximum development has no charge',()=>{
 const s=createState();s.cash=1e7;
 for(const site of SITES){let previous=income(s);while((s.levels[site.id]||0)<MAX_LEVEL){const q=quote(s,site.id),cash=s.cash;invest(s,site.id);assert.equal(s.cash,cash-q.cost);assert(income(s)>previous);previous=income(s);}const before=structuredClone(s);assert.throws(()=>invest(s,site.id));assert.deepEqual(s,before);}
});
test('Insufficient funds leave both ownership and capital unchanged',()=>{const s=createState();s.cash=0;const before=structuredClone(s);assert.throws(()=>invest(s,'bottega'));assert.deepEqual(s,before);assert.throws(()=>invest(s,'san-giorgio'));});
test('Income, spending and the separate save ledger reconcile',()=>{const s=createState();invest(s,'bottega');for(let i=0;i<120;i++)step(s,1);assert(Math.abs(s.cash-(START_CASH+s.earned-s.spent))<.001);assert.deepEqual(restore(JSON.stringify(s)),s);const broken=structuredClone(s);broken.cash+=100;assert.equal(restore(JSON.stringify(broken)),null);});
test('Colliding saved positions are repaired and malformed home levels are rejected',()=>{const s=createState();s.position=[SITES[0].x,SITES[0].z];assert.deepEqual(restore(JSON.stringify(s)).position,[-4,6]);delete s.levels.casa;assert.equal(restore(JSON.stringify(s)),null);});
test('Every landmark has a reachable entrance and cannot be purchased',()=>{const s=createState();for(const p of PUBLIC_SITES){const route=findPath([-4,6],p.door);assert(route.length,p.name);assert(route.every(([x,z])=>walkable(x,z)),p.name);assert.throws(()=>invest(s,p.id));}});
test('Canal crossings route to the bridge instead of walking on water',()=>{assert(!walkable(-99,40));assert(walkable(-99,70));const route=findPath([-112,40],[-88,40]);assert(route.length);const crossings=route.filter(([x])=>x>CANAL.left&&x<CANAL.right);assert(crossings.length);assert(crossings.every(([,z])=>Math.abs(z-70)<4));});
test('Business and solid landmark plots never overlap',()=>{const plots=[...SITES,...PUBLIC_SITES.filter(s=>s.solid!==false)];for(let i=0;i<plots.length;i++)for(let j=i+1;j<plots.length;j++){const a=plots[i],b=plots[j];assert(!(Math.abs(a.x-b.x)<(a.w+b.w)/2&&Math.abs(a.z-b.z)<(a.d+b.d)/2),a.name+' / '+b.name);}});
