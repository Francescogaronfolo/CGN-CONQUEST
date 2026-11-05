import test from 'node:test';
import assert from 'node:assert/strict';
import {CivicView} from '../milano/comuni/view.js';
import {createGame,place} from '../milano/comuni/engine.js';
import {COMUNI} from '../milano/comuni/data.js';
import {paintBuilding} from '../milano/comuni/buildings.js';
const id=COMUNI.find(c=>c.name==='Cuggiono').id;
function render(scale){const g=createGame({provinceBoard:true,bots:1});place(g,id);g.urbanLinks=[{a:id,b:COMUNI[id].neighbors[0]}];const counts={roads:0,links:0,sites:0,buildings:0},v=Object.create(CivicView.prototype);v.g=g;v.ctx=new Proxy({},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,x)=>(o[k]=x,true)});v.w=1280;v.h=720;v.local=id;v.hits=[];v.transform=()=>({scale,x:0,y:0});v.screen=p=>[p[0]*scale,p[1]*scale];v.world=(x,y)=>x===0&&y===0?[0,0]:[77,66];v.landscape=()=>{};v.strokePublicRoad=()=>counts.roads++;v.drawRoadNetwork=()=>counts.roads++;v.drawUrbanLink=()=>counts.links++;v.drawPlannedSite=()=>counts.sites++;v.district=()=>counts.buildings++;v.drawProvinceBoard({});return{counts,hits:v.hits};}
test('province overview has no connections, building thumbnails, parcels or frontier controls',()=>{const {counts,hits}=render(8);assert.deepEqual(counts,{roads:0,links:0,sites:0,buildings:0});assert.ok(hits.every(h=>h.kind==='company'));});
test('construction zoom restores public streets, links, zones and completed buildings',()=>{const {counts}=render(30);assert.ok(counts.roads>329);assert.equal(counts.links,1);assert.ok(counts.sites>1000);assert.ok(counts.buildings>=2);});
test('all six 2D building types and development tiers render without bitmap or perspective transforms',()=>{let marks=0;const c=new Proxy({globalAlpha:1},{get:(o,k)=>{if(k==='drawImage'||k==='rotate'||k==='transform')throw Error('Unexpected perspective or atlas');return o[k]??((...args)=>{for(const n of args.filter(a=>typeof a==='number'))assert.ok(Number.isFinite(n));marks++;});},set:(o,k,v)=>(o[k]=v,true)});for(const type of ['housing','industry','energy','commerce','logistics','airport'])for(const level of [1,4,8])paintBuilding(c,{type,level,id:10},0,0,96,64);assert.ok(marks>0);});
