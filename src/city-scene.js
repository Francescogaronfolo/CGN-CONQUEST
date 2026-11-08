import {CATEGORIES,landStyle,chooseLabels} from './cartography.js';
import {buildingDesign,drawBuildingDetails,coastVelocity} from './building-design.js';

// A deliberately spaced, orthographic 3D game board derived from real geometry.
// Heights without OSM measurements are visual conventions, never surveyed facts.
export function metres([lon,lat]){return[(lon-8.8)*78000,(45.51-lat)*111320];}
export function projectPoint(point,centre,scale,width,height,offset={x:0,y:0},heightMetres=0){
 const [x,y]=metres(point),[cx,cy]=metres(centre),dx=x-cx,dy=y-cy;
 return{x:width/2+(dx*.94-dy*.34)*scale+offset.x,y:height*.53+(dx*.34+dy*.94)*scale*.62+offset.y-heightMetres*scale*.85};
}
export function insetRing(ring,factor=.62){const unique=ring.slice(0,-1),c=[0,1].map(j=>unique.reduce((n,p)=>n+p[j],0)/unique.length);return ring.map(p=>p.map((v,j)=>c[j]+(v-c[j])*factor));}
export function contains(point,ring){let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a.y>point.y)!=(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)yes=!yes;}return yes;}
export function pickBuilding(point,hits){
 const direct=hits.slice().reverse().find(h=>contains(point,h.roof)||contains(point,h.base)||h.base.slice(0,-1).some((p,i)=>contains(point,[p,h.base[i+1],h.roof[i+1],h.roof[i]])));
 if(direct)return direct;
 return hits.map(h=>({h,d:Math.hypot(point.x-h.roof.reduce((s,p)=>s+p.x,0)/h.roof.length,point.y-h.roof.reduce((s,p)=>s+p.y,0)/h.roof.length)})).filter(x=>x.d<=14).sort((a,b)=>a.d-b.d)[0]?.h;
}
function rings(g){return g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];}
export class CityScene{
 constructor({host,geo,landscape,places,onBuilding,onPlace,onMove,assetStyle,primaryIds}){
  Object.assign(this,{places,onBuilding,onPlace,onMove,assetStyle,primaryIds});this.primaryIds=primaryIds;this.centre=[8.8158,45.5064];this.scale=1.8;this.offset={x:0,y:0};this.active=true;this.filter='all';this.hits=[];this.labelHits=[];
  this.canvas=document.createElement('canvas');this.canvas.id='city-scene';this.canvas.setAttribute('aria-label','Vista urbana 3D stilizzata. Trascina per spostarti, usa i comandi zoom e tocca un edificio.');this.canvas.tabIndex=0;host.append(this.canvas);this.ctx=this.canvas.getContext('2d');
  this.buildings=geo.features.filter(f=>f.properties.kind==='building').flatMap(f=>rings(f.geometry).map(p=>{const r=p[0],c=[0,1].map(j=>r.slice(0,-1).reduce((s,p)=>s+p[j],0)/(r.length-1));return{f,ring:r,centre:c};}));
  this.roads=geo.features.filter(f=>f.properties.kind==='road');this.water=geo.features.filter(f=>f.properties.kind==='water');this.land=landscape.features;
  this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;this.placeByBuilding=new Map();for(const p of places){const id=p.buildingId||p.id,old=this.placeByBuilding.get(id);if(!old||p.priority>old.priority)this.placeByBuilding.set(id,p);}
  this.bind();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();
 }
 project(point,h=0){return projectPoint(point,this.centre,this.scale,this.w,this.h,this.offset,h);}
 resize(){this.w=this.canvas.clientWidth;this.h=this.canvas.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=this.w*dpr;this.canvas.height=this.h*dpr;this.ctx.setTransform(dpr,0,0,dpr,0,0);this.draw();}
 path(points){const p=new Path2D();points.forEach((v,i)=>i?p.lineTo(v.x,v.y):p.moveTo(v.x,v.y));p.closePath();return p;}
 polygon(geometry,color,alpha=1){const c=this.ctx;c.fillStyle=color;c.globalAlpha=alpha;for(const p of rings(geometry)){const path=new Path2D();for(const ring of p){ring.forEach((v,i)=>{const q=this.project(v);i?path.lineTo(q.x,q.y):path.moveTo(q.x,q.y);});path.closePath();}c.fill(path,'evenodd');}c.globalAlpha=1;}
 lines(features,color,width){const c=this.ctx;c.lineCap='round';c.lineJoin='round';for(const f of features){const p=f.properties,coords=f.geometry.type==='LineString'?f.geometry.coordinates:null;if(!coords){this.polygon(f.geometry,'#e8dfca');continue;}const main=['primary','secondary','tertiary'].includes(p.highway);c.strokeStyle=color;c.lineWidth=Math.max(1,Math.min(23,width*(main?1.5:1)*this.scale));c.beginPath();coords.forEach((v,i)=>{const q=this.project(v);i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);});c.stroke();}}
 terrainLayer(){const pad=300;let t=this.terrain;const changed=!t||t.scale!==this.scale||t.w!==this.w||t.h!==this.h||t.centre!==this.centre||Math.abs(t.offset.x-this.offset.x)>pad-20||Math.abs(t.offset.y-this.offset.y)>pad-20;if(changed){const canvas=document.createElement('canvas');canvas.width=this.w+pad*2;canvas.height=this.h+pad*2;const oldCtx=this.ctx,oldOffset=this.offset;this.ctx=canvas.getContext('2d');this.offset={x:oldOffset.x+pad,y:oldOffset.y+pad};this.ctx.fillStyle='#e6ebdd';this.ctx.fillRect(0,0,canvas.width,canvas.height);for(const f of this.land)this.polygon(f.geometry,landStyle(f.properties).fillColor,.8);this.lines(this.water,'#8db9c0',12);this.lines(this.roads,'#c0c4b7',9);this.lines(this.roads,'#faf7ea',6);this.ctx=oldCtx;this.offset=oldOffset;t=this.terrain={canvas,scale:this.scale,w:this.w,h:this.h,centre:this.centre,offset:{...this.offset}};}this.ctx.drawImage(t.canvas,-pad+this.offset.x-t.offset.x,-pad+this.offset.y-t.offset.y);}
 draw(){if(!this.active||!this.ctx||!this.w)return;const c=this.ctx;c.clearRect(0,0,this.w,this.h);c.fillStyle='#e6ebdd';c.fillRect(0,0,this.w,this.h);
  this.terrainLayer();
  const visible=this.buildings.map(b=>({...b,p:this.project(b.centre)})).filter(b=>b.p.x>-150&&b.p.x<this.w+150&&b.p.y>-150&&b.p.y<this.h+200).sort((a,b)=>a.p.y-b.p.y);
  this.hits=[];for(const b of visible){const p=b.f.properties,asset=this.assetStyle(b.f.id),important=!!p.name||this.placeByBuilding.has(b.f.id)||['heritage','civic','industry','commerce'].includes(p.category);if(!important&&!asset&&(!this.primaryIds.has(b.f.id)||this.scale<.15))continue;
   const ring=insetRing(b.ring,important?.78:.57),rawHeight=parseFloat(p.height),height=Number.isFinite(rawHeight)?Math.min(35,Math.max(3,rawHeight)):p.category==='industry'?7:p.category==='heritage'?14:p.category==='civic'?11:8;
   const base=ring.map(v=>this.project(v)),roof=ring.map(v=>this.project(v,height));const path=this.path(roof),palette=CATEGORIES[p.category]||CATEGORIES.unknown;
   c.fillStyle='#364b3824';c.fill(this.path(base.map(v=>({x:v.x+height*this.scale*.55,y:v.y+height*this.scale*.25}))));
   for(let i=0;i<base.length-1;i++){const a=base[i],d=base[i+1];c.fillStyle=asset?asset.color:i%2?'#969f92':'#b7baa6';c.fill(this.path([a,d,roof[i+1],roof[i]]));}
   c.fillStyle=asset?asset.fillColor:p.category==='unknown'?'#d4b994':p.category==='residential'?'#cfa480':palette.fill;c.fill(path);c.strokeStyle=asset?asset.color:palette.stroke;c.lineWidth=asset?1.8:.65;c.stroke(path);
   if(this.scale>.55)drawBuildingDetails(c,{design:buildingDesign(p,this.placeByBuilding.get(b.f.id)),roof,base,scale:this.scale,path});
   this.hits.push({id:b.f.id,base,roof,centre:b.p});
  }
  for(const p of this.places){if(p.buildingId||this.buildings.some(b=>b.f.id===p.id)||!['heritage','commerce','industry'].includes(p.category))continue;const q=this.project(p.point);if(q.x<0||q.x>this.w||q.y<120||q.y>this.h-70)continue;const size=Math.max(4,Math.min(10,this.scale*4));c.fillStyle='#b8ad8d';c.beginPath();c.moveTo(q.x-size,q.y);c.lineTo(q.x,q.y+size*.5);c.lineTo(q.x+size,q.y);c.lineTo(q.x,q.y-size*.5);c.closePath();c.fill();if(p.category==='heritage'){c.fillStyle='#a19c8d';c.fillRect(q.x-size*.35,q.y-size*1.8,size*.7,size*1.6);c.fillStyle='#f4e5c0';c.fillRect(q.x-size*.5,q.y-size*1.9,size,size*.25);}else{c.fillStyle=p.category==='industry'?'#91a8ae':'#ddc59e';c.fillRect(q.x-size,q.y-size*1.4,size*2,size*1.3);c.fillStyle='#64959d';c.fillRect(q.x-size*.7,q.y-size,size*1.4,size*.6);c.fillStyle='#c5754b';c.fillRect(q.x-size*1.1,q.y-size*1.5,size*2.2,size*.3);}}
  this.labelHits=[];const candidates=this.places.map(p=>({...p,kind:'poi',minZoom:p.priority>=100?14:16}));
  const zoom=this.scale<.2?14:this.scale<.5?16:18;
  for(const p of chooseLabels(candidates,point=>this.project(point,12),{width:this.w,height:this.h},zoom,this.filter)){
   const q=this.project(p.point,12),text=p.name.length>28?p.name.slice(0,27)+'…':p.name;c.font='600 11px Arial';const width=c.measureText(text).width+18;const x=q.x-width/2,y=q.y-28;
   c.fillStyle='#fffdf4f2';c.strokeStyle='#d6d4c4';c.lineWidth=1;c.beginPath();c.roundRect(x,y,width,25,6);c.fill();c.stroke();c.fillStyle=p.category==='heritage'?'#856337':'#395a50';c.fillText(text,x+9,y+16);c.strokeStyle='#88967b';c.beginPath();c.moveTo(q.x,y+25);c.lineTo(q.x,q.y+8);c.stroke();this.labelHits.push({p,x,y,w:width,h:25});
  }
 }
 focus(point,overview=false){this.stopMotion();this.centre=point;this.offset={x:0,y:0};this.scale=overview?Math.max(.08,Math.min(this.w/6500,this.h/4400)):1.8;this.draw();}
 setFilter(value){this.filter=value;this.draw();}
 setActive(value){this.stopMotion();this.active=value;this.canvas.hidden=!value;document.body.classList.toggle('city-view',value);if(value)this.resize();}
 stopMotion(){if(this.motion)cancelAnimationFrame(this.motion);this.motion=null;}
 coast(vx,vy){if(this.reducedMotion)return;this.stopMotion();let last=performance.now();const tick=now=>{const dt=Math.min(32,now-last);last=now;vx=coastVelocity(vx,dt);vy=coastVelocity(vy,dt);this.offset.x+=vx*dt;this.offset.y+=vy*dt;this.draw();if(Math.hypot(vx,vy)>.015)this.motion=requestAnimationFrame(tick);else this.motion=null;};this.motion=requestAnimationFrame(tick);}
 zoom(factor){this.onMove();this.stopMotion();const from=this.scale,to=Math.max(.08,Math.min(3.5,from*factor));if(this.reducedMotion){this.scale=to;this.draw();return;}const begin=performance.now();const tick=now=>{const t=Math.min(1,(now-begin)/160);this.scale=from+(to-from)*(1-(1-t)**3);this.draw();if(t<1)this.motion=requestAnimationFrame(tick);else this.motion=null;};this.motion=requestAnimationFrame(tick);}
 bind(){const el=this.canvas,pointers=new Map();let start=null,pinch=0,vx=0,vy=0,lastMove=0;
  el.onpointerdown=e=>{this.stopMotion();vx=vy=0;lastMove=performance.now();el.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});start={x:e.clientX,y:e.clientY,moved:false};if(pointers.size===2){const [a,b]=[...pointers.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);start.moved=true;}};
  el.onpointermove=e=>{const old=pointers.get(e.pointerId);if(!old||!start)return;const dx=e.clientX-old.x,dy=e.clientY-old.y,now=performance.now(),dt=Math.max(1,now-lastMove);vx=Math.max(-2.5,Math.min(2.5,vx*.5+dx/dt*.5));vy=Math.max(-2.5,Math.min(2.5,vy*.5+dy/dt*.5));lastMove=now;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const[a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch)this.scale=Math.max(.08,Math.min(3.5,this.scale*d/pinch));pinch=d;start.moved=true;}else{this.offset.x+=dx;this.offset.y+=dy;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>5)start.moved=true;}if(start.moved)this.onMove();this.schedule();};
  el.onpointerup=e=>{const wasPinch=pointers.size>1;pointers.delete(e.pointerId);if(start?.moved&&!wasPinch&&!pointers.size&&performance.now()-lastMove<90)this.coast(vx,vy);if(start&&!start.moved){const r=el.getBoundingClientRect(),p={x:e.clientX-r.left,y:e.clientY-r.top};const label=this.labelHits.find(b=>p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h);if(label)this.onPlace(label.p);else{const hit=pickBuilding(p,this.hits);if(hit)this.onBuilding(hit.id);}}start=pointers.size?{...pointers.values().next().value,moved:true}:null;pinch=0;};
  el.onpointercancel=()=>{pointers.clear();start=null;pinch=0;};el.onwheel=e=>{e.preventDefault();this.zoom(e.deltaY<0?1.15:1/1.15);};el.ondblclick=e=>e.preventDefault();el.onkeydown=e=>{const moves={ArrowLeft:[60,0],ArrowRight:[-60,0],ArrowUp:[0,60],ArrowDown:[0,-60]};if(moves[e.key]){e.preventDefault();this.offset.x+=moves[e.key][0];this.offset.y+=moves[e.key][1];this.onMove();this.draw();}if(e.key==='+'||e.key==='=')this.zoom(1.3);if(e.key==='-')this.zoom(1/1.3);};
 }
 schedule(){if(this.frame)return;this.frame=requestAnimationFrame(()=>{this.frame=null;this.draw();});}
}
