import test from 'node:test';
import assert from 'node:assert/strict';
import {COMUNI} from '../milano/comuni/data.js';
import {createGame,place,advance,serialize,restore,audit,auditLayout} from '../milano/comuni/engine.js';
import {validPlans} from '../milano/comuni/plans.js';
test('province AI can develop and expand for ten minutes with valid accounts, public routes and save',()=>{const g=createGame({provinceBoard:true,bots:5,seed:42});place(g,COMUNI.find(c=>c.name==='Cuggiono').id);for(let n=0;n<20;n++){advance(g,30);assert.ok(audit(g)&&auditLayout(g)&&validPlans(g));}assert.ok(g.cities.some(c=>c.buildings.length>2));assert.ok(g.urbanLinks.length>0);assert.ok(restore(serialize(g)));});
