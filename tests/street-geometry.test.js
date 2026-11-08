import test from 'node:test';
import assert from 'node:assert/strict';
import {nearestRoad,normalizeMovement,ringContains} from '../src/street-geometry.js';
const roads=[{properties:{name:'Via di prova'},geometry:{type:'LineString',coordinates:[[0,0],[10,0]]}}];
test('Entry snaps a click to the actual road segment, never an arbitrary terrain point',()=>{const spawn=nearestRoad({x:4,y:2},roads,p=>({x:p[0],y:p[1]}),3);assert.deepEqual(spawn.point,[4,0]);assert.equal(spawn.name,'Via di prova');assert(Number.isFinite(spawn.heading));assert.equal(nearestRoad({x:4,y:20},roads,p=>({x:p[0],y:p[1]}),3),null);});
test('Road entry clamps to endpoints and handles a zero-length segment',()=>{assert.deepEqual(nearestRoad({x:11,y:0},roads,p=>({x:p[0],y:p[1]}),3).point,[10,0]);const short=[{properties:{},geometry:{type:'LineString',coordinates:[[1,1],[1,1]]}}];assert(Number.isFinite(nearestRoad({x:1,y:1},short,p=>({x:p[0],y:p[1]})).heading));});
test('Diagonal keyboard and analogue input cannot exceed walking speed',()=>{assert(Math.abs(Math.hypot(...normalizeMovement(1,1))-1)<1e-12);assert.deepEqual(normalizeMovement(.2,.3),[.2,.3]);});
test('Footprint collision detects solid interiors and permits outside movement',()=>{const ring=[[0,0],[5,0],[5,5],[0,5],[0,0]];assert(ringContains([2,2],ring));assert(!ringContains([8,2],ring));});
