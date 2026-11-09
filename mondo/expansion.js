import * as T from '../vendor/three/three.module.js';
import {ROADS,CANAL,BRIDGES,PUBLIC_SITES} from './places.js';
export function buildRoadNetwork(view,{box,cylinder}){
 for(const road of ROADS)for(let i=1;i<road.points.length;i++){
  const a=road.points[i-1],b=road.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),group=new T.Group();group.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);group.rotation.y=-Math.atan2(dz,dx);view.scene.add(group);
  box(group,0,.025,0,length,.12,road.width+2.8,'#d5d5bc');box(group,0,.1,0,length,.08,road.width,'#819087');
  for(const p of [a,b]){cylinder(view.scene,p[0],.025,p[1],(road.width+2.8)/2,.12,'#d5d5bc',16);cylinder(view.scene,p[0],.1,p[1],road.width/2,.08,'#819087',16);}
 }
}
export function buildExpansion(view,kit){
 const {box,cylinder,sphere,roof,windows,label}=kit,g=view.scene;
 function register(object,site,height){object.userData.publicId=site.id;object.traverse(m=>{if(m.isMesh)m.userData.publicId=site.id;});view.hitMeshes.push(object);const l=label(site.name,site.name.length>24?13:10);l.position.set(site.x,height,site.z);l.userData.publicId=site.id;g.add(l);view.hitMeshes.push(l);view.landmarkGroups.set(site.id,{group:object,site,height});view.labels.push({sprite:l,public:true});}
 // A quiet rural seam connects the two inhabited areas without filler houses.
 for(const [x,z,w,d]of [[-78,-7,35,23],[-95,-59,31,41],[50,76,35,38]]){box(g,x,.025,z,w,.06,d,'#c2cda4');for(let i=0;i<6;i++)box(g,x-w/2+(i+.5)*w/6,.07,z,.18,.045,d-1,'#b4c295');}
 box(g,-41,-.005,-65,50,.08,54,'#bfc8b3');
 for(const x of [-65,-15])for(const z of [-91,-73,-43])view.tree(x,z,1.05);
 // Naviglio, towpaths and masonry banks form a continuous, non-walkable waterway.
 const canalSite=PUBLIC_SITES.find(s=>s.id==='naviglio'),water=new T.Group();g.add(water);
 const length=CANAL.bottom-CANAL.top,cz=(CANAL.bottom+CANAL.top)/2,cx=(CANAL.left+CANAL.right)/2;
 box(water,cx,-.62,cz,10,1.1,length,'#5f918b');const surface=box(water,cx,-.04,cz,9.5,.05,length,'#6eaba4');surface.castShadow=false;
 for(const x of [CANAL.left-.7,CANAL.right+.7])box(water,x,.04,cz,1.4,.3,length,'#b4b49d');
 for(const x of [CANAL.left-3.5,CANAL.right+3.5])box(g,x,.06,cz,4,.12,length,'#d9d1b0');
 water.traverse(m=>{if(m.isMesh)m.userData.publicId='naviglio';});view.hitMeshes.push(water);view.landmarkGroups.set('naviglio',{group:water,site:canalSite,height:2});
 view.extraAnimations=[];
 for(let i=0;i<8;i++){const streak=box(g,cx-3+(i%3)*2.8,.006,18+i*10,1.5,.015,.06,'#a5c9be');streak.castShadow=false;view.extraAnimations.push(t=>{streak.position.z=18+(i*10+t*.35)%78;});}
 for(const z of [15,29,45,91,103])for(const x of [-112,-86])view.tree(x,z,.95);
 for(const bridge of BRIDGES){const b=new T.Group();b.position.set(bridge.x,0,bridge.z);g.add(b);box(b,0,.08,0,bridge.length,.24,bridge.width,'#d5c6a4');
  for(const z of [-bridge.width/2,bridge.width/2]){box(b,0,.75,z,bridge.length,.85,.45,'#c3b397');for(const x of [-10,-5,5,10])box(b,x,1.22,z,.65,.12,.7,'#d7c6a5');}
  for(const x of [-5.5,5.5])box(b,x,-.45,0,1.2,1.1,bridge.width,'#aca88f');register(b,PUBLIC_SITES.find(s=>s.id==='ponte'),3.2);
 }
 // A small moored boat gives scale without turning the map into a busy harbour.
 const boat=new T.Group();boat.position.set(-98,-.01,45);g.add(boat);box(boat,0,.25,0,2.7,.55,7,'#395f56');box(boat,0,.63,0,2.2,.35,5.5,'#c2aa7d');box(boat,0,1,-1.8,2,1.1,2,'#e2d3ae');view.extraAnimations.push(t=>{boat.rotation.z=Math.sin(t*.7)*.018;});
 // Public buildings are landmarks only; private business purchases remain separate.
 for(const site of PUBLIC_SITES.filter(s=>!['san-giorgio','annoni','ponte','naviglio'].includes(s.id))){
  const root=new T.Group();root.position.set(site.x,0,site.z);g.add(root);let height=7;
  if(site.type==='palace'){
   box(root,0,3.8,0,18,7.6,10,'#d6b27d');roof(root,19,11,7.6,'#9f6b50',1.8);windows(root,18,10,5.5,5);windows(root,18,10,2.4,5);
   for(const x of [-9,9]){box(root,x,2.4,0,3.5,4.8,12,'#d1ae7c');}
   for(let i=0;i<8;i++)box(g,-91.8+i*.45,.04+i*.09,37,.5,.15+i*.18,5.2,'#d4c4a4');
   for(const z of [33.8,40.2]){box(g,-90,.75,z,5,1,.3,'#cbb997');for(const x of [-92,-90,-88])cylinder(g,x,1.4,z,.18,1.2,'#e0cfac',8);}
   box(g,-90,.08,27,5,.18,10,'#9eb384');box(g,-90,.08,47,5,.18,8,'#9eb384');height=11;
  }else if(site.type==='hospital'){
   box(root,0,3.6,0,19,7.2,12,'#e5e4cc');box(root,0,7.35,0,20,.35,13,'#8ea99b');
   for(const x of [-10,10])box(root,x,2.4,1,4,4.8,12,'#d1dcd0');
   for(const y of [2.3,5])for(let i=-3;i<=3;i++)box(root,i*2.3,y,6.08,1.5,1.15,.12,'#789d98');
   box(root,0,2.5,7.2,5,.25,3.2,'#749a93');box(root,0,1.2,6.25,3,2.4,.2,'#4f7b77');
   box(root,6,8.05,1,1.15,.2,3.5,'#5c8f9a');box(root,6,8.05,1,3.5,.2,1.15,'#5c8f9a');
   box(g,56,.08,-31.5,23,.13,7,'#abb7ab');for(let i=0;i<7;i++)box(g,46+i*3,.16,-31.5,.08,.018,6,'#dedbc2');for(let i=-3;i<=3;i++)box(g,56,.16,-38+i*.65,2.5,.02,.29,'#e9e3ca');height=10;
  }else if(site.type==='police'){
   box(root,0,2.7,0,11,5.4,9,'#d6ccb4');roof(root,12,10,5.4,'#7c887b',1);windows(root,11,9,3.6,3);box(root,0,1.4,4.6,1.5,2.8,.1,'#455c54');box(root,0,3,4.72,4.5,.6,.1,'#364e46');box(root,0,2.73,4.8,4.5,.1,.06,'#a76959');
   cylinder(root,5,3.2,5,.06,6.4,'#a0aa92',7);for(const [x,color]of [[4.8,'#558b69'],[5.2,'#eee8d1'],[5.6,'#b77a65']])box(root,x,5.6,5,.4,1,.07,color);height=8;
  }else if(site.type==='school'){
   box(root,0,2.5,0,site.w-3,5,site.d-3,'#e3cd8c');box(root,0,5.15,0,site.w-2,.3,site.d-2,'#87a699');
   for(const y of [1.8,3.8])for(let i=-2;i<=2;i++){box(root,i*2.5,y,(site.d-3)/2+.08,1.3,1.05,.12,'#779f9a');}
   box(root,0,1.2,(site.d-3)/2+.2,1.7,2.4,.16,'#467969');
   box(root,site.w*.25,5.55,0,2.2,.6,2.2,'#d9bd75');for(let i=-2;i<=2;i++)box(root,i*2.6,.2,(site.d-3)/2+1.8,1.1,.04,1,'#bdcca7');height=8;
  }else if(site.type==='oratory'){
   box(root,-2,2.3,0,8,4.6,8,'#d9cbb0');roof(root,10,9,4.6,'#a47756',1.3);box(root,4,1.7,0,4,3.4,8,'#e1cfaa');box(root,-2,1.4,4.05,1.3,2.8,.1,'#597363');
   box(g,-49,.08,50,17,.15,13,'#95b18a');for(const x of [-55,-43]){box(g,x,1.1,50,.12,2.1,4,'#e4dfc6');box(g,x,2.1,50,.15,.15,4.1,'#e4dfc6');}box(g,-49,.18,50,.12,.02,11,'#d5dec0');height=7;
  }else if(site.type==='chapel'){
   root.rotation.y=Math.PI;box(root,0,3,0,8,6,9,'#dfc9a2');roof(root,9,10,6,'#9d7056',1.5);box(root,0,1.5,4.65,1.7,3,.12,'#6f6950');box(root,3,5.5,-2,1.6,11,1.8,'#c0ac86');height=12;
  }else if(site.type==='square'){
   box(root,0,.13,0,site.w,.16,site.d,'#d9d0b0');for(const x of [-site.w/2+2,site.w/2-2]){box(root,x,.65,0,2,.18,.6,'#9a7e58');box(root,x,1,-.3,2,.6,.12,'#9a7e58');}cylinder(root,0,.25,0,1.4,.3,'#a7b78c',16);sphere(root,0,1.5,0,1.2,'#769768');height=3;
  }
  register(root,site,height);
 }
}
