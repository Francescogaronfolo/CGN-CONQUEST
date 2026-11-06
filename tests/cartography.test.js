import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chooseLabels,roadWidth,baseBuildingStyle} from '../src/cartography.js';
import * as E from '../src/engine.js';
const read=name=>JSON.parse(fs.readFileSync(new URL('../data/'+name,import.meta.url)));
const catalog=read('catalog.json'),places=read('places.json').places,land=read('landscape.geojson');
const point=p=>({x:p[0],y:p[1]});
const label=(name,x,y,priority,category='commerce')=>({name,point:[x,y],priority,category,kind:'poi',minZoom:16});
test('Landmark priority wins collisions; zoom and viewport hide crowded labels',()=>{
 const candidates=[label('Negozio',200,220,20),label('Villa Annoni',200,220,100,'heritage'),label('Fuori schermo',900,220,30)];
 assert.deepEqual(chooseLabels(candidates,point,{width:600,height:700},17).map(p=>p.name),['Villa Annoni']);
 assert.equal(chooseLabels(candidates,point,{width:600,height:700},15).length,0);
 assert.equal(candidates[0].name,'Negozio');
});
test('Mobile labels leave the top controls and bottom dock free',()=>{
 const candidates=[label('Sotto i comandi',120,150,50),label('Visibile',120,240,40),label('Sotto il dock',120,790,30)];
 assert.deepEqual(chooseLabels(candidates,point,{width:390,height:844},17).map(p=>p.name),['Visibile']);
});
test('Business and heritage filters select relevant POIs without changing source data',()=>{
 const list=[label('Impresa',100,250,50),label('Villa',300,250,100,'heritage')];
 assert.deepEqual(chooseLabels(list,point,{width:600,height:700},17,'business').map(p=>p.name),['Impresa']);
 assert.deepEqual(chooseLabels(list,point,{width:600,height:700},17,'heritage').map(p=>p.name),['Villa']);
});
test('Road widths remain readable and bounded at every zoom',()=>{for(let z=13;z<=20;z++){assert(roadWidth('primary',z)>=roadWidth('path',z));assert(roadWidth('primary',z)<=18);}assert.notEqual(baseBuildingStyle({properties:{category:'industry'}}).fillColor,baseBuildingStyle({properties:{category:'residential'}}).fillColor);});
test('Verified geography contains the requested landmarks, businesses and park footprint',()=>{
 for(const name of ['Villa Annoni','Palazzo Clerici','Chiesa di San Giorgio','Museo storico civico cuggionese','SIM S.r.l.'])assert(places.some(p=>p.name===name),name);
 assert(land.features.some(f=>f.properties.name==='Parco di Villa Annoni'));
 assert(land.features.some(f=>f.properties.landuse==='industrial'));
 for(const p of places){assert.match(p.source,/^https:\/\/www.openstreetmap.org\/(node|way|relation)\/[0-9]+$/);assert.equal(p.tags.phone,undefined);assert.equal(p.tags.email,undefined);}
});
test('Protected public or heritage properties cannot be bought; prior saves remain usable',()=>{
 const w=E.createWorld(catalog);const p=catalog.find(p=>p.protected&&!w.assets[p.id]);assert(p);
 const before=JSON.stringify(w);assert.throws(()=>E.buy(w,catalog,0,p.id));assert.equal(JSON.stringify(w),before);
 assert(!catalog.find(p=>p.id===w.players[0].home).protected);
 const oldCatalog=catalog.map(({realName,realCategory,protected:protectedFlag,...p})=>p);const oldWorld=E.createWorld(oldCatalog);assert(E.restore(JSON.stringify(oldWorld),catalog));
});
