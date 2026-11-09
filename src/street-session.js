import {PHOTO_SCENES} from './photo-street-model.js';
import {distanceMetres} from './real-street-model.js';
export function photoAt(point,selected=null,maxDistance=120){
 const nearby=PHOTO_SCENES.map(scene=>({scene,distance:distanceMetres(point,scene.point)})).filter(s=>s.distance<=maxDistance);
 return nearby.sort((a,b)=>Number(b.scene.sites.some(s=>s.id===selected))-Number(a.scene.sites.some(s=>s.id===selected))||a.distance-b.distance)[0]||null;
}
export function photoTransition(snapshot,selected=null){const match=photoAt(snapshot.point,selected);return match?{sceneId:match.scene.id,resume:{...snapshot,point:snapshot.point.slice()},selected}:null;}
export function walkTransition(session,sceneId,snap){
 if(session?.sceneId===sceneId&&session.resume)return{...session.resume,point:session.resume.point.slice()};
 const scene=PHOTO_SCENES.find(s=>s.id===sceneId);return snap(scene.point,scene.name);
}
