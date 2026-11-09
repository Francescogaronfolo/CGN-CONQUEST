import * as T from '../vendor/three/three.module.js';
import {PHOTO_SCENES} from './photo-street-model.js';
const photographs=new Map();
export function facadeSource(id){for(const scene of PHOTO_SCENES){const site=scene.sites.find(s=>s.id===id);if(site)return{scene,site};}return null;}
function photograph(scene){if(!photographs.has(scene.id))photographs.set(scene.id,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{photographs.delete(scene.id);reject(Error('Foto non disponibile'));};image.src=scene.file;}));return photographs.get(scene.id);}
// Crop only the licensed facade polygon, not sky or the rest of the street.
// This is an illustrative surface texture, not a photogrammetric reconstruction.
export function addPhotoFacade(view,id,outline,height){
 const source=facadeSource(id);if(!source)return false;
 const {scene,site}=source;let edge=null;const camera=view.camera.position;
 for(let i=1;i<outline.length;i++){const a=outline[i-1],b=outline[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<2)continue;const score=Math.hypot((a[0]+b[0])/2-camera.x,(a[1]+b[1])/2-camera.z);if(!edge||score<edge.score)edge={a,b,length,score};}
 if(!edge)return false;
 const key='photo-facade:'+id;let material=view.materials.get(key);
 if(!material){material=new T.MeshBasicMaterial({transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false});view.materials.set(key,material);
  photograph(scene).then(image=>{const xs=site.polygon.map(p=>p[0]),ys=site.polygon.map(p=>p[1]),left=Math.min(...xs),top=Math.min(...ys),w=Math.max(...xs)-left,h=Math.max(...ys)-top,canvas=document.createElement('canvas');canvas.width=512;canvas.height=Math.max(128,Math.min(768,Math.round(512*h*image.height/(w*image.width))));const c=canvas.getContext('2d');c.beginPath();site.polygon.forEach(([x,y],i)=>{const px=(x-left)/w*canvas.width,py=(y-top)/h*canvas.height;i?c.lineTo(px,py):c.moveTo(px,py);});c.closePath();c.clip();c.drawImage(image,left*image.width,top*image.height,w*image.width,h*image.height,0,0,canvas.width,canvas.height);material.map=new T.CanvasTexture(canvas);material.map.colorSpace=T.SRGBColorSpace;material.opacity=1;material.needsUpdate=true;}).catch(()=>{});
 }
 const {a,b,length}=edge,m=new T.Mesh(new T.PlaneGeometry(length,height),material);m.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);const cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2,dx=camera.x-cx,dz=camera.z-cz,n=Math.hypot(dx,dz)||1;m.position.set(cx+dx/n*.045,height/2,cz+dz/n*.045);m.userData.id=id;view.assets.add(m);view.meshes.push(m);return true;
}
