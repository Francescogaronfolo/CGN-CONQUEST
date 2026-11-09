import test from 'node:test';
import assert from 'node:assert/strict';
import {SITES,MAX_LEVEL,START_CASH,createState,income,quote,invest,step,restore,walkable,findPath} from '../mondo/model.js';
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
