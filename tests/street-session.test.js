import test from 'node:test';
import assert from 'node:assert/strict';
import {PHOTO_SCENES} from '../src/photo-street-model.js';
import {photoAt,photoTransition,walkTransition} from '../src/street-session.js';
test('Photo round trip restores exact walking position and camera rather than resetting the spawn',()=>{
 const scene=PHOTO_SCENES[0],snapshot={point:[scene.point[0]+.0001,scene.point[1]],heading:1.23,pitch:.15,name:'Alzaia'};
 const transfer=photoTransition(snapshot,scene.sites[0].id);assert(transfer);assert.equal(transfer.selected,scene.sites[0].id);
 const returned=walkTransition(transfer,transfer.sceneId,()=>{throw Error('Unexpected teleport');});assert.deepEqual(returned,snapshot);assert.notEqual(returned.point,snapshot.point);
});
test('Changing location discards the previous walking position',()=>{
 const session=photoTransition({point:PHOTO_SCENES[0].point,heading:1,name:'Ponte'});
 let requested;const result=walkTransition(session,'matteotti',(point,name)=>{requested=point;return{point,name,heading:0};});
 assert.deepEqual(requested,PHOTO_SCENES.find(s=>s.id==='matteotti').point);assert.notDeepEqual(result.point,session.resume.point);
});
test('No photo transition is offered outside available photographic coverage',()=>{
 assert.equal(photoAt([8.84,45.53]),null);assert.equal(photoTransition({point:[8.84,45.53],heading:0}),null);
});
test('Nearby selection uses the photograph containing that property when coverage overlaps',()=>{
 for(const scene of PHOTO_SCENES){assert.equal(photoAt(scene.point,scene.sites[0].id)?.scene.id,scene.id);}
});
