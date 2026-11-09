import {buildRoadNetwork,buildExpansion} from './expansion.js';
import {groundHeight,CANAL} from './places.js';
import * as T from '../vendor/three/three.module.js';
import {SITES,PUBLIC_SITES} from './model.js';
const materials=new Map();
function mat(color){if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.9}));return materials.get(color);}
function box(parent,x,y,z,w,h,d,color){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(parent,x,y,z,r,h,color,segments=12){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,segments),mat(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
function sphere(parent,x,y,z,r,color){const m=new T.Mesh(new T.IcosahedronGeometry(r,1),mat(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
function roof(parent,w,d,y,color='#a95d43',rise=1.7){const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,rise);shape.lineTo(w/2,0);shape.closePath();const mesh=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,steps:1}),mat(color));mesh.position.set(0,y,-d/2);mesh.castShadow=true;parent.add(mesh);return mesh;}
function label(text,scale=7){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const c=canvas.getContext('2d');c.font='600 43px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fffcef';c.strokeStyle='#d4dcca';c.lineWidth=2;c.beginPath();c.roundRect(12,15,488,65,22);c.fill();c.stroke();c.fillStyle='#315347';c.fillText(text,256,49,465);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const material=new T.SpriteMaterial({map:texture,depthTest:false,transparent:true});const sprite=new T.Sprite(material);sprite.scale.set(scale,scale*96/512,1);sprite.renderOrder=15;return sprite;}
function windows(parent,w,d,y,count,lit=false){for(let i=0;i<count;i++){const x=(i-(count-1)/2)*Math.min(2.6,w/(count+.5));box(parent,x,y,d/2+.025,1.05,1.3,.12,'#eee4cc');box(parent,x,y,d/2+.1,.78,1.02,.08,lit?'#e8c77c':'#496f6e');box(parent,x,y,d/2+.16,.055,1.05,.045,'#eee4cc');for(const side of [-1,1])box(parent,x+side*.7,y,d/2+.09,.25,1.18,.13,'#527568');}
 for(const side of [-1,1])for(let i=0;i<2;i++){const z=(i-.5)*d*.45;box(parent,side*(w/2+.04),y,z,.1,1.12,.85,'#e9dfca');box(parent,side*(w/2+.11),y,z,.06,.9,.65,lit?'#d6c48a':'#567d79');}}
function awning(parent,w,d){for(let i=0;i<7;i++){const m=box(parent,(i-3)*w/7,2.8,d/2+.72,w/7,.14,1.55,i%2?'#e9dec5':'#356e61');m.rotation.x=.15;box(parent,(i-3)*w/7,2.58,d/2+1.46,w/7,.32,.12,i%2?'#e9dec5':'#356e61');}}
function disposeTree(root){root.traverse(m=>{m.geometry?.dispose();if(m.isSprite){m.material.map?.dispose();m.material.dispose();}});}
export class TownScene{
 constructor(host,state){
  this.host=host;this.state=state;this.scene=new T.Scene();this.scene.background=new T.Color('#dfe7d2');this.scene.fog=new T.Fog('#dfe7d2',200,400);this.renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,matchMedia('(pointer:coarse)').matches?1.35:1.7));this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;this.renderer.shadowMap.enabled=!matchMedia('(pointer:coarse)').matches;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.domElement.setAttribute('aria-label','Mondo stilizzato di Cuggiono: tocca un edificio o una strada');host.append(this.renderer.domElement);
  this.scene.add(new T.HemisphereLight('#fff8df','#8aab7e',1.7));const sun=new T.DirectionalLight('#fff0cf',2.4);sun.position.set(-105,195,105);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-145,right:145,top:145,bottom:-145,near:1,far:400});sun.shadow.normalBias=.04;sun.shadow.bias=-.0001;this.scene.add(sun);
  this.camera=new T.OrthographicCamera(-30,30,25,-25,.1,250);this.look=new T.Vector3(state.position[0],0,state.position[1]);this.size=51;this.targetSize=51;this.overview=false;this.ray=new T.Raycaster();this.buildings=new Map();this.hitMeshes=[];this.labels=[];this.landmarkGroups=new Map();this.growth=[];this.cars=[];this.selection=new T.Group();this.scene.add(this.selection);this.buildGround();this.buildLandmarks();buildExpansion(this,{box,cylinder,sphere,roof,windows,label});for(const site of SITES)this.buildSite(site);this.buildCharacter();this.resize();
 }
 buildGround(){
  const g=this.scene;box(g,-20,-.42,0,340,.65,290,'#c9d4ae');const land=new T.Shape();land.moveTo(-136,106);land.lineTo(104,106);land.lineTo(104,-114);land.lineTo(-136,-114);land.closePath();const hole=new T.Path();hole.moveTo(CANAL.left,-CANAL.top);hole.lineTo(CANAL.left,-CANAL.bottom);hole.lineTo(CANAL.right,-CANAL.bottom);hole.lineTo(CANAL.right,-CANAL.top);hole.closePath();land.holes.push(hole);const terrain=new T.Mesh(new T.ShapeGeometry(land),mat('#d2dbba'));terrain.rotation.x=-Math.PI/2;terrain.receiveShadow=true;g.add(terrain);
  // The streets form one continuous, readable village network.
  buildRoadNetwork(this,{box,cylinder});
  cylinder(g,0,.11,0,10.5,.1,'#cdcbb1',48);cylinder(g,0,.17,0,8.6,.06,'#d6d2b8',48);
  const fountain=new T.Group();fountain.position.set(-.2,0,.2);g.add(fountain);cylinder(fountain,0,.26,0,1.6,.22,'#c1c8ad',32);cylinder(fountain,0,.4,0,1.22,.1,'#73a9a1',32);cylinder(fountain,0,1,0,.23,1.25,'#e3debf');sphere(fountain,0,1.75,0,.32,'#b9bd9c');
  for(let x=-39;x<42;x+=7)if(Math.abs(x)>12)box(g,x,.16,0,2.2,.018,.12,'#cbd0bb');for(let z=-30;z<32;z+=7)if(Math.abs(z)>12)box(g,0,.16,z,.12,.018,2.1,'#cbd0bb');
  for(const [x,z,turn]of [[-15,0,false],[16,0,false],[0,-15,true],[0,16,true]])for(let i=-2;i<=2;i++){const strip=box(g,x+(turn?i*.6:0),.185,z+(turn?0:i*.6),turn?.32:4,.016,turn?4:.32,'#e9e7cf');}
  for(const site of SITES){box(g,site.x,.08,site.z,site.w+1.5,.16,site.d+1.5,'#c2cbb0');box(g,site.x,.175,site.z,site.w+1,.05,site.d+1,'#e1d9bd');}
  // Villa garden: a distinct, ordered southern landmark rather than random decor.
  box(g,4,.1,44,34,.18,23,'#a7be8e');box(g,4,.22,35,4,.1,9,'#e0d5b5');box(g,4,.2,49,25,.1,2,'#d8d0ac');
  for(const x of [-10,18])for(const z of [34,40,47,53])this.tree(x,z,1.1);
  for(const [x,z,r]of [[-39,-24,1.4],[-34,-29,1.6],[-28,-29,1.3],[-20,-27,1.5],[28,-28,1.4],[36,-26,1.7],[40,-19,1.3],[-40,35,1.6],[-38,44,1.7],[-34,49,1.4],[37,35,1.5],[38,44,1.7],[29,50,1.4],[-19,47,1.5],[20,-20,1],[16,16,.85],[-18,15,.9],[-37,14,1.1]])this.tree(x,z,r);
  for(const [x,z,angle]of [[-6,-6,.3],[6,6,.3],[-6,6,-.3],[6,-6,-.3]]){const bench=new T.Group();bench.position.set(x,0,z);bench.rotation.y=angle;g.add(bench);box(bench,0,.8,0,2.1,.18,.7,'#997958');box(bench,0,1.2,-.3,2.1,.65,.12,'#997958');for(const dx of [-.7,.7])box(bench,dx,.4,0,.12,.7,.35,'#536859');}
  for(const [x,z]of [[-18,4.6],[18,4.6],[-18,-4.6],[18,-4.6],[4.6,17],[-4.6,30]]){cylinder(g,x,1.7,z,.075,3.4,'#506b5c',8);const cap=box(g,x,3.5,z,.45,.25,.45,'#e5dab7');cap.castShadow=false;}
  this.streetText('PIAZZA SAN GIORGIO',-1,-11,12);this.streetText('VIA ANNONI',5,17,8);this.streetText('VIA FRATELLI PIAZZA',-24,-3.8,12);
  for(let i=0;i<2;i++){const car=new T.Group();box(car,0,.5,0,2.2,.65,1.15,i?'#ba7657':'#5b8d7b');box(car,-.1,1,0,1.1,.5,1,'#ddd7bc');for(const x of [-.7,.7])for(const z of [-.63,.63])cylinder(car,x,.31,z,.25,.15,'#3a4e46',8).rotation.x=Math.PI/2;g.add(car);this.cars.push(car);}
 }
 tree(x,z,size=1){const g=this.scene;cylinder(g,x,.85*size,z,.14*size,1.7*size,'#947c57',7);sphere(g,x,2.5*size,z,1.3*size,'#6e9668');sphere(g,x-.5*size,2.3*size,z+.5*size,.88*size,'#80a36e');cylinder(g,x,.15,z,1.5*size,.03,'#afbf96',14);}
 streetText(text,x,z,w){const sprite=label(text,w);sprite.position.set(x,.25,z);sprite.material.depthTest=true;sprite.material.opacity=.7;this.scene.add(sprite);}
 buildLandmarks(){
  const church=new T.Group();church.position.set(7,0,-25);church.userData.publicId='san-giorgio';this.scene.add(church);box(church,0,3.5,0,9,7,11,'#ded2b0');roof(church,10,12,7,'#a66b4f',2.2);box(church,0,2.3,5.6,2.3,4.6,.2,'#786b51');cylinder(church,0,6,5.65,1,.13,'#7d9080',24).rotation.x=Math.PI/2;
  const tower=box(church,4,8,-2,2.8,16,2.8,'#c6ad86');box(church,4,14.4,-.55,1.25,1.9,.12,'#5f7666');const cap=new T.Mesh(new T.ConeGeometry(2,3.2,4),mat('#758c7a'));cap.position.set(4,17.6,-2);cap.rotation.y=Math.PI/4;cap.castShadow=true;church.add(cap);
  const a=new T.Group();a.position.set(4,0,44);a.userData.publicId='annoni';this.scene.add(a);box(a,0,3.4,0,12,6.8,6,'#e3cc91');roof(a,13,7,6.8,'#997257',1.6);for(const x of [-9,9]){const wing=new T.Group();wing.position.x=x;a.add(wing);box(wing,0,2,-1,6,4,8,'#e1cd9c');roof(wing,7,9,4,'#a47854',1.2);windows(wing,6,8,2.2,2);}
  windows(a,12,6,4.4,4);box(a,0,2.4,3.15,2,4.8,.16,'#647765');for(const x of [-2.1,2.1])cylinder(a,x,2,4,.2,4,'#f1e7cc');box(a,0,4.2,4,5,.4,2,'#eadaba');
  for(const [object,id,name,y]of [[church,'san-giorgio','San Giorgio',20],[a,'annoni','Villa Annoni',10]]){object.traverse(o=>{if(o.isMesh)o.userData.publicId=id;});this.hitMeshes.push(object);this.landmarkGroups.set(id,{group:object,site:PUBLIC_SITES.find(s=>s.id===id),height:y});const l=label(name,8);l.position.set(object.position.x,y,object.position.z);l.userData.publicId=id;this.scene.add(l);this.hitMeshes.push(l);this.labels.push({sprite:l,public:true});}
 }
 buildSite(site,grow=false){
  const old=this.buildings.get(site.id);if(old){this.scene.remove(old.group);disposeTree(old.group);this.hitMeshes=this.hitMeshes.filter(m=>m!==old.group);}
  const level=this.state.levels[site.id]||0,stage=Math.ceil(Math.max(1,level)/2),g=new T.Group();g.position.set(site.x,0,site.z);g.rotation.y=site.facing||0;g.userData.siteId=site.id;this.scene.add(g);
  const w=site.w*(.73+.034*Math.max(0,level-1)),d=site.d*(.72+.025*Math.max(0,level-1));let h=3.25+Math.max(1,level)*.95;
  if(site.type==='workshop'||site.type==='logistics')h=3.45+Math.max(1,level)*.55;
  box(g,0,.35,0,w+.45,.6,d+.45,'#d4cbb2');box(g,0,h/2+.4,0,w,h,d,level>=4?'#e9dabe':site.color);
  box(g,0,h+.3,0,w+.2,.22,d+.2,'#e8dfc7');
  if(['workshop','logistics'].includes(site.type)){
   if(site.type==='workshop'){for(let i=0;i<3;i++){const piece=new T.Group();piece.position.x=(i-1)*w/3;g.add(piece);roof(piece,w/3+.1,d+.4,h+.45,'#7a897c',.75);}box(g,w*.28,h+1.7,-d*.27,.6,3,.6,'#ad7960');}
   else{box(g,0,h+.5,0,w+.5,.25,d+.5,'#7a8d80');box(g,0,1.6,d/2+.08,w*.52,2.5,.15,'#607b70');for(let i=0;i<4;i++)box(g,-w*.22+i*w*.145,1.6,d/2+.18,.045,2.5,.04,'#a8b7a0');}
   if(level>=3)for(let i=0;i<3;i++)box(g,w*.28, .7+i*.26,d*.22,1.3,.25,1.2,i%2?'#bd9b65':'#d2b781');
  }else{
   roof(g,w+.8,d+.75,h+.42,level>=5?'#805d4a':site.type==='office'?'#748b7c':'#ac694b',1.5+stage*.15);windows(g,w,d,2.3,Math.max(2,Math.floor(w/2.6)),level>=3);if(h>5)windows(g,w,d,h-1.3,Math.max(2,Math.floor(w/2.6)),level>=5);if(h>8)windows(g,w,d,4.85,Math.max(2,Math.floor(w/2.6)),true);
   box(g,w*.25,h+1.3,-d*.18,.65,1.8,.65,'#b98967');box(g,0,1.4,d/2+.15,1.1,2.4,.18,'#365d50');if(['shop','cafe'].includes(site.type))awning(g,w,d);
   if(site.type==='cafe'){for(const x of [-2,2]){cylinder(g,x,.9,d/2+1.9,.65,.12,'#cbb592');cylinder(g,x,.5,d/2+1.9,.08,.9,'#6d7560');}}
  }
  if(level){box(g,w*.26,2.6,d/2+.21,1.25,.55,.09,'#1e7057');for(let i=0;i<Math.min(3,stage);i++)box(g,w*.26-.35+i*.35,2.6,d/2+.27,.12,.12,.025,'#f0d58d');}
  g.traverse(m=>{if(m.isMesh)m.userData.siteId=site.id;});this.hitMeshes.push(g);
  const l=label(site.id==='casa'?'La tua casa':site.name,site.name.length>18?9:7.5);l.position.set(0,h+3.6,0);l.userData.siteId=site.id;g.add(l);
  this.buildings.set(site.id,{group:g,label:l,height:h+3.6,site});if(grow){g.scale.y=.65;this.growth.push({group:g,t:0});}
 }
 buildCharacter(){this.avatar=new T.Group();this.scene.add(this.avatar);this.avatar.position.set(...[this.state.position[0],0,this.state.position[1]]);cylinder(this.avatar,0,.03,0,.72,.025,'#9dad8d',18);sphere(this.avatar,0,1.85,0,.37,'#d6af83');box(this.avatar,0,1.17,0,.66,.9,.48,'#294e42');box(this.avatar,0,1.2,.34,.55,.62,.23,'#cda24d');this.legs=[];this.arms=[];for(const side of [-1,1]){const leg=new T.Group();leg.position.set(side*.18,.74,0);box(leg,0,-.25,0,.22,.65,.25,'#34493f');box(leg,0,-.56,-.06,.27,.15,.4,'#405344');this.avatar.add(leg);this.legs.push(leg);const arm=new T.Group();arm.position.set(side*.46,1.57,0);box(arm,0,-.31,0,.19,.68,.22,'#315648');sphere(arm,0,-.68,0,.11,'#d6af83');this.avatar.add(arm);this.arms.push(arm);}
  const arrow=new T.Mesh(new T.ConeGeometry(.32,.6,3),new T.MeshBasicMaterial({color:'#dcae4b',depthTest:false}));arrow.renderOrder=30;arrow.rotation.z=Math.PI;arrow.position.y=3.2;this.avatar.add(arrow);this.arrow=arrow;
 }
 setSelected(id){this.selected=id;while(this.selection.children.length){const o=this.selection.children[0];this.selection.remove(o);o.geometry?.dispose();}const site=SITES.find(s=>s.id===id);if(!site)return;const points=[[-site.w/2-.5,-site.d/2-.5],[site.w/2+.5,-site.d/2-.5],[site.w/2+.5,site.d/2+.5],[-site.w/2-.5,site.d/2+.5],[-site.w/2-.5,-site.d/2-.5]].map(([x,z])=>new T.Vector3(x+site.x,.24,z+site.z));const line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:'#cba444'}));this.selection.add(line);}
 setRoute(points){if(this.route){this.scene.remove(this.route);this.route.geometry.dispose();this.route.material.dispose();this.route=null;}if(points.length<2)return;this.route=new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(p[0],.25,p[1]))),new T.LineDashedMaterial({color:'#e9d29b',dashSize:.7,gapSize:.45,transparent:true,opacity:.85}));this.route.computeLineDistances();this.scene.add(this.route);}
 resize(){this.renderer.setSize(innerWidth,innerHeight);this.aspect=innerWidth/innerHeight;}
 pick(x,y){this.ray.setFromCamera(new T.Vector2(x/innerWidth*2-1,-y/innerHeight*2+1),this.camera);const hit=this.ray.intersectObjects(this.hitMeshes,true)[0];if(hit){if(hit.object.userData.siteId)return{siteId:hit.object.userData.siteId};if(hit.object.userData.publicId)return{publicId:hit.object.userData.publicId,point:[hit.point.x,hit.point.z]};}const plane=new T.Plane(new T.Vector3(0,1,0),0),point=new T.Vector3();return this.ray.ray.intersectPlane(plane,point)?{point:[point.x,point.z]}:null;}
 screenFor(id){const b=this.buildings.get(id)||this.landmarkGroups.get(id);if(!b)return null;const p=new T.Vector3(b.site.x,b.height*.65,b.site.z).project(this.camera);return{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2};}
 update(dt,position,direction,moving,time){
  this.avatar.position.set(position[0],groundHeight(...position),position[1]);if(moving){const angle=Math.atan2(-direction[0],-direction[1]),delta=Math.atan2(Math.sin(angle-this.avatar.rotation.y),Math.cos(angle-this.avatar.rotation.y));this.avatar.rotation.y+=delta*(1-Math.exp(-dt*15));}this.legs.forEach((l,i)=>l.rotation.x=moving?Math.sin(time*10+i*Math.PI)*.58:0);this.arms.forEach((a,i)=>a.rotation.x=moving?Math.sin(time*10+i*Math.PI)*-.45:0);this.arrow.position.y=3.2+Math.sin(time*2)*.1;
  this.size+=(this.targetSize-this.size)*(1-Math.exp(-dt*6));const target=this.overview?new T.Vector3(-21,0,3):new T.Vector3(position[0],0,position[1]);this.look.lerp(target,1-Math.exp(-dt*5));this.camera.left=-this.size*this.aspect/2;this.camera.right=this.size*this.aspect/2;this.camera.top=this.size/2;this.camera.bottom=-this.size/2;this.camera.position.copy(this.look).add(new T.Vector3(35,54,43));this.camera.lookAt(this.look);this.camera.updateProjectionMatrix();
  for(const b of this.buildings.values()){const distance=Math.hypot(b.site.x-position[0],b.site.z-position[1]);b.label.visible=b.site.id===this.selected||b.site.id==='casa'&&!this.overview||distance<15&&!this.overview;b.label.material.opacity=b.site.id===this.selected?1:.9;}
  for(const item of this.growth){item.t+=dt;item.group.scale.y=.65+.35*(1-Math.pow(1-Math.min(1,item.t/1.1),3));}this.growth=this.growth.filter(g=>g.t<1.1);
  this.cars.forEach((car,i)=>{const phase=(time*(i?2.3:2.8)+i*45)%86;car.position.set((i?43-phase:phase-43),0,i?-1.6:1.6);car.rotation.y=i?Math.PI:0;});
  this.extraAnimations?.forEach(fn=>fn(time));this.renderer.render(this.scene,this.camera);
 }
}
