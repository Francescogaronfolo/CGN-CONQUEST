import test from 'node:test';
import assert from 'node:assert/strict';
import {pickTarget,panDecay,relationship,pendingAlliance} from '../milano/comuni/interaction.js';
import {CivicView} from '../milano/comuni/view.js';
import {COMUNI} from '../milano/comuni/data.js';

test('a building wins over the street underneath, independent of drawing order',()=>{
 const street={kind:'street',box:[10,10,80,80]},building={kind:'building',id:7,box:[20,20,50,50]};
 assert.equal(pickTarget([street,building],30,30),building);
 assert.equal(pickTarget([building,street],30,30),building);
});
test('touch padding helps small lots without stealing an exact neighboring target',()=>{
 const first={kind:'building',id:1,box:[20,20,40,40]},second={kind:'site',id:2,box:[45,20,65,40]};
 assert.equal(pickTarget([first],46,30,false),undefined);
 assert.equal(pickTarget([first],46,30,true),first);
 assert.equal(pickTarget([first,second],46,30,true),second);
 assert.equal(pickTarget([first,second],95,30,true),undefined);
});
test('among nearby plots choose the nearest center rather than first registered',()=>{
 const a={kind:'site',id:1,box:[0,0,20,20]},b={kind:'site',id:2,box:[24,0,44,20]};
 assert.equal(pickTarget([a,b],23,10,true),b);
});
test('inertia decays with equal travel across frame rates and cannot run forever',()=>{
 let distance=0,v=[1000,0];for(let i=0;i<180;i++){const q=panDecay(v,1/60);distance+=q.move[0];v=q.velocity;}
 let distance30=0,v30=[1000,0];for(let i=0;i<90;i++){const q=panDecay(v30,1/30);distance30+=q.move[0];v30=q.velocity;}
 assert.deepEqual(v,[0,0]);assert.ok(distance>100&&distance<112);assert.ok(Math.abs(distance-distance30)<.15);
});
test('expired coalitions are rivals and reciprocal permissions are visible in either direction',()=>{
 const g={time:10,treaties:[{type:'coalition',a:1,b:0,until:11}],offers:[]};
 assert.equal(relationship(g,0),'mine');assert.equal(relationship(g,1),'ally');g.time=11;assert.equal(relationship(g,1),'rival');g.treaties=[{type:'transit',a:1,b:0,until:20}];assert.equal(relationship(g,1),'trade');
 const offer={kind:'coalition',from:1,to:0};g.offers=[offer];assert.equal(pendingAlliance(g,1),offer);
});
test('border geometry is reused until ownership actually changes',()=>{
 const view=Object.create(CivicView.prototype);view.g={cities:COMUNI.map(c=>({id:c.id,owner:null}))};
 const a=view.borders();assert.equal(view.borders(),a);view.g.cities[0].owner=0;const b=view.borders();assert.notEqual(a,b);assert.equal(view.borders(),b);
});
test('pinching or dragging back to the origin never triggers a purchase selection',()=>{
 const saved={ResizeObserver:globalThis.ResizeObserver,devicePixelRatio:globalThis.devicePixelRatio};globalThis.ResizeObserver=class{observe(){}};globalThis.devicePixelRatio=1;
 try{
  let picks=0;const canvas={clientWidth:390,clientHeight:844,setPointerCapture(){},getContext(){return{setTransform(){}};}};
  const view=new CivicView(canvas,()=>picks++);view.find=()=>1;
  const event=(x,y,id=1)=>({clientX:x,clientY:y,pointerId:id,pointerType:'touch',button:0});
  canvas.onpointerdown(event(40,40));canvas.onpointermove(event(80,40));canvas.onpointermove(event(40,40));canvas.onpointerup(event(40,40));assert.equal(picks,0);
  canvas.onpointerdown(event(40,40));canvas.onpointerdown(event(80,80,2));canvas.onpointerup(event(80,80,2));canvas.onpointerup(event(40,40));assert.equal(picks,0);
  canvas.onpointerdown(event(40,40));canvas.onpointerup(event(40,40));assert.equal(picks,1);
 }finally{for(const [k,v]of Object.entries(saved)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
});
