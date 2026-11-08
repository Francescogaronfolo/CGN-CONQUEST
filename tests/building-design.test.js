import test from 'node:test';
import assert from 'node:assert/strict';
import {buildingDesign,coastVelocity} from '../src/building-design.js';
test('Distinct architectural archetypes survive changes in ownership colour',()=>{
 assert.equal(buildingDesign({name:'Villa Annoni',category:'heritage'}),'villa');
 assert.equal(buildingDesign({name:'Palazzo Clerici',category:'heritage'}),'palace');
 assert.equal(buildingDesign({building:'church',category:'civic'}),'church');
 assert.equal(buildingDesign({category:'civic'},{name:'Comune di Cuggiono',tags:{amenity:'townhall'}}),'townhall');
 assert.equal(buildingDesign({category:'industry'}),'factory');
 assert.equal(buildingDesign({category:'commerce'}),'shop');
 assert.equal(buildingDesign({category:'residential'}),'home');
});
test('Coasting decays consistently across frame rates and never reverses direction',()=>{
 assert(coastVelocity(1,16)>0&&coastVelocity(1,16)<1);
 assert(coastVelocity(-1,16)<0);
 assert(Math.abs(coastVelocity(coastVelocity(1,16),16)-coastVelocity(1,32))<1e-12);
 let velocity=2;for(let i=0;i<90;i++)velocity=coastVelocity(velocity,16);assert(velocity<.001);
});
