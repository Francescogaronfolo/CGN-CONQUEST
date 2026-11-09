import {PHOTO_SCENES} from './photo-street-model.js';
import {photoAt,photoTransition,walkTransition} from './street-session.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class StreetExperience{
 constructor({describe,act,createWalker,createPhoto,snap,onMap}){
  Object.assign(this,{describe,act,createWalker,createPhoto,snap,onMap});this.active=false;this.mode='walk';this.session=null;this.selected=null;
  this.root=document.createElement('section');this.root.id='street-shell';this.root.hidden=true;this.root.setAttribute('aria-label','Esplora strada · foto e 3D unificati');
  this.root.innerHTML=`<div class="unified-top"><button data-map>← Mappa</button><div class="unified-title"><strong>Esplora strada</strong><small class="unified-address"></small></div><div class="unified-modes" role="group" aria-label="Rappresentazione strada"><button data-mode="walk">3D</button><button data-mode="photo">Foto</button></div><button data-places>Luoghi ▾</button></div><nav class="unified-places" aria-label="Punti collegati della strada" hidden>${PHOTO_SCENES.map(s=>`<button data-place="${s.id}"><img src="${s.file}" loading="lazy" alt=""><span>${esc(s.short||s.name)}</span></button>`).join('')}</nav><p class="unified-note" role="status"></p><aside class="unified-card" aria-label="Edificio selezionato" hidden></aside><details class="unified-credits"><summary>Foto e texture · fonti</summary>${PHOTO_SCENES.map(s=>`<div><a href="${s.source}" target="_blank" rel="noopener">${esc(s.name)}</a> · ${esc(s.author)} · <a href="${s.licenseURL}" target="_blank" rel="noopener">${esc(s.license)}</a></div>`).join('')}<small>Scatti storici e texture ritagliate. Associazioni agli immobili indicative, non rilievi verificati.</small></details>`;
  document.body.append(this.root);this.card=this.root.querySelector('.unified-card');
  this.root.querySelector('[data-map]').onclick=()=>this.exit();this.root.querySelector('[data-places]').onclick=()=>{const nav=this.root.querySelector('.unified-places');nav.hidden=!nav.hidden;};
  for(const b of this.root.querySelectorAll('[data-mode]'))b.onclick=()=>this.switchMode(b.dataset.mode);
  for(const b of this.root.querySelectorAll('[data-place]'))b.onclick=()=>this.goPlace(b.dataset.place);
  document.addEventListener('keydown',e=>{if(!this.active||e.key!=='Escape')return;e.stopImmediatePropagation();e.preventDefault();if(!this.card.hidden)this.closeCard();else this.exit();},true);
 }
 async walker(){if(!this.walk)this.walk=await this.createWalker({onExit:()=>this.exit(),onInspect:id=>this.inspect(id)});return this.walk;}
 async photographer(){if(!this.photo)this.photo=await this.createPhoto({onExit:()=>this.exit(),onInspect:id=>this.inspect(id),onGame:()=>this.switchMode('walk'),onScene:scene=>{this.sceneId=scene.id;this.position={point:scene.point.slice(),name:scene.name,heading:0};this.update();}});return this.photo;}
 async enter(spawn,mode='walk',sceneId=null){
  if(this.busy)return;this.active=true;this.root.hidden=false;document.body.classList.add('street-unified');this.position=spawn;this.sceneId=sceneId||photoAt(spawn.point)?.scene.id||PHOTO_SCENES[0].id;this.session=null;this.closeCard();this.mode=mode==='photo'?'walk':'photo';
  if(mode==='photo')this.position={point:PHOTO_SCENES.find(s=>s.id===this.sceneId).point.slice(),name:PHOTO_SCENES.find(s=>s.id===this.sceneId).name,heading:0};
  await this.switchMode(mode,true);clearInterval(this.timer);this.timer=setInterval(()=>{if(!this.active)return;this.update();const el=this.card.querySelector('.unified-cash');if(el&&this.selected)el.textContent=this.describe(this.selected).cash;},500);
 }
 async switchMode(mode,initial=false){
  if(this.busy||!initial&&this.mode===mode)return;this.busy=true;this.note('Caricamento della vista…');
  try{
   if(mode==='photo'){
    if(!initial){const transfer=photoTransition(this.walk.snapshot(),this.selected);if(!transfer){this.note('Nessuna foto in questo punto. Continua in 3D oppure scegli un luogo.');return;}this.session=transfer;this.sceneId=transfer.sceneId;}
    const photo=await this.photographer();if(!this.active)return;this.walk?.suspend();this.mode='photo';photo.enter(this.sceneId);if(this.selected&&photo.current.sites.some(s=>s.id===this.selected)){photo.selected=this.selected;photo.renderSites();}
   }else{
    const walk=await this.walker();if(!this.active)return;const spawn=initial?this.position:walkTransition(this.session,this.sceneId,this.snap);this.photo?.suspend();this.mode='walk';walk.enter(spawn);this.position=spawn;
   }
   this.updateURL();this.update();
  }catch(e){this.note('Vista non disponibile: '+e.message);}
  finally{this.busy=false;}
 }
 async goPlace(id){if(this.busy)return;const scene=PHOTO_SCENES.find(s=>s.id===id);this.sceneId=id;this.session=null;this.position=this.snap(scene.point,scene.name);this.closeCard();this.root.querySelector('.unified-places').hidden=true;
  if(this.mode==='photo'){this.photo.go(id);this.updateURL();this.update();}else{this.walk.enter(this.position);this.updateURL();this.update();}
 }
 update(){if(!this.active)return;const position=this.mode==='walk'?this.walk?.snapshot()||this.position:this.position;const match=photoAt(position.point,this.selected);const photoButton=this.root.querySelector('[data-mode=photo]');photoButton.disabled=this.mode==='walk'&&!match;photoButton.title=match?'Fotografia disponibile in questa zona':'Nessuna fotografia vicina: resta in 3D o scegli Luoghi';
  for(const b of this.root.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',String(b.dataset.mode===this.mode));this.root.querySelector('.unified-address').textContent=this.mode==='photo'?this.photo.current.name:position.name;
  this.note(this.mode==='photo'?'Foto del luogo · acquisti e livelli condivisi con il 3D':match?'Foto disponibile qui · passa a Foto senza perdere la posizione':'Esplorazione 3D · nessuna fotografia disponibile qui');
 }
 updateURL(){const url=new URL(location.href);url.searchParams.set('view',this.mode==='photo'?'foto':'strada');url.searchParams.set('scene',this.sceneId);history.replaceState(null,'',url);}
 note(text){this.root.querySelector('.unified-note').textContent=text;}
 inspect(id){this.selected=id;this.walk?.keys.clear();if(this.walk)this.walk.joy={x:0,y:0};const q=this.describe(id);this.card.hidden=false;this.card.innerHTML=`<button class="unified-close" aria-label="Chiudi edificio">×</button><small>PROPRIETÀ VIRTUALE · STESSA PARTITA</small><h2>${esc(q.title)}</h2><p>${esc(q.detail)}</p><strong class="unified-cash">${esc(q.cash)}</strong>${q.action?`<button class="primary" data-action>${esc(q.action)}</button>`:''}<p class="unified-result" role="status"></p>`;
  this.card.querySelector('.unified-close').onclick=()=>this.closeCard();const action=this.card.querySelector('[data-action]');if(action)action.onclick=()=>{try{this.act(id);this.inspect(id);this.photo?.renderSites();this.card.querySelector('.unified-result').textContent='Investimento aggiornato in entrambe le viste.';}catch(e){this.card.querySelector('.unified-result').textContent=e.message;}};
 }
 closeCard(){this.selected=null;this.card.hidden=true;if(this.walk)this.walk.selected=null;}
 exit(){if(!this.active)return;const position=this.mode==='walk'?this.walk?.snapshot():this.position;this.active=false;this.walk?.suspend();this.photo?.suspend();clearInterval(this.timer);this.root.hidden=true;document.body.classList.remove('street-unified');const url=new URL(location.href);url.searchParams.delete('view');url.searchParams.delete('scene');history.replaceState(null,'',url);this.onMap(position?.point||this.position.point);}
}
