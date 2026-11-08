import {REAL_STREET_STOPS,nearbyProperties,mapsStreetURL} from './real-street-model.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let googleLoad;
function loadGoogle(key){
 if(window.google?.maps?.StreetViewPanorama)return Promise.resolve(window.google.maps);
 if(googleLoad)return googleLoad;
 googleLoad=new Promise((resolve,reject)=>{const script=document.createElement('script');let timer;const fail=()=>{clearTimeout(timer);script.remove();googleLoad=null;reject(Error('Il servizio fotografico non risponde. Puoi tornare alla vista di gioco.'));};
 window.cgnGoogleReady=()=>{clearTimeout(timer);delete window.cgnGoogleReady;resolve(window.google.maps);};
 script.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(key)+'&callback=cgnGoogleReady&loading=async&v=quarterly';script.async=true;script.onerror=fail;timer=setTimeout(fail,20000);document.head.append(script);
 });return googleLoad;
}
export class RealStreet{
 constructor({catalog,describe,act,onExit,onGame}){Object.assign(this,{catalog,describe,act,onExit,onGame});this.markers=[];this.root=document.createElement('section');this.root.id='real-street';this.root.hidden=true;this.root.setAttribute('aria-label','Strada reale · laboratorio');
 this.root.innerHTML=`<div class="real-panorama" id="real-panorama"></div><div class="real-toolbar"><button data-exit>← Mappa</button><strong>Strada reale <small>LABORATORIO · STESSA PARTITA</small></strong><button data-game>Vista 3D ↗</button></div><nav class="real-stops" aria-label="Percorso reale">${REAL_STREET_STOPS.map((s,i)=>`<button data-stop="${i}">${esc(s.name)}</button>`).join('')}</nav><div class="real-status" role="status"></div><aside class="real-properties"><div class="real-properties-head"><strong>Proprietà vicine</strong><button data-collapse aria-label="Riduci proprietà vicine">−</button></div><div class="real-properties-body"><small>Attività virtuali · distanze indicative, non ingressi verificati.</small><div class="real-list"></div><div class="real-detail" hidden></div></div></aside>`;
 document.body.append(this.root);this.root.querySelector('[data-exit]').onclick=()=>this.exit();this.root.querySelector('[data-game]').onclick=()=>{const point=this.point.slice(),heading=this.panorama?.getPov().heading||0;this.exit();onGame({point,name:this.name,heading:-heading*Math.PI/180});};
 this.root.querySelector('[data-collapse]').onclick=e=>{const body=this.root.querySelector('.real-properties-body');body.hidden=!body.hidden;e.currentTarget.textContent=body.hidden?'+':'−';};
 for(const b of this.root.querySelectorAll('[data-stop]'))b.onclick=()=>this.go(REAL_STREET_STOPS[Number(b.dataset.stop)]);
 this.escape=e=>{if(this.active&&e.key==='Escape')this.exit();};window.addEventListener('keydown',this.escape);
 }
 async enter(){this.active=true;this.root.hidden=false;document.body.classList.add('real-street-active');this.go(REAL_STREET_STOPS[0]);if(this.config!==undefined)return;try{const r=await fetch('/api/street-config');this.config=r.ok?(await r.json()).googleMapsBrowserKey||'':'';}catch{this.config='';}if(this.active)this.go({name:this.name,point:this.point,heading:270});}
 exit(){this.active=false;this.root.hidden=true;this.panorama?.setVisible(false);document.body.classList.remove('real-street-active');this.onExit();}
 status(html){this.root.querySelector('.real-status').innerHTML=html;}
 async go(stop){this.point=stop.point.slice();this.name=stop.name;this.selected=null;this.root.querySelector('.real-detail').hidden=true;this.updateNearby();const request=this.request=(this.request||0)+1;
 if(!this.config){this.status(`<strong>${esc(stop.name)}</strong><p>Il percorso è pronto. Le fotografie nel gioco attendono l’attivazione di Google Maps.</p><a href="${mapsStreetURL(this.point)}" target="_blank" rel="noopener noreferrer">Esplora questo punto su Google Maps ↗</a><small>La visita esterna non sincronizza gli spostamenti. Qui puoi già gestire le proprietà vicine o passare alla vista 3D.</small>`);return;}
 this.status('Ricerca del panorama reale…');try{const maps=await loadGoogle(this.config);if(!this.active||request!==this.request)return;this.service??=new maps.StreetViewService();
 const result=await this.service.getPanorama({location:{lat:this.point[1],lng:this.point[0]},radius:60,preference:maps.StreetViewPreference.NEAREST});if(!this.active||request!==this.request)return;
 if(!this.panorama){this.panorama=new maps.StreetViewPanorama(this.root.querySelector('.real-panorama'),{addressControl:false,fullscreenControl:false,motionTracking:false,motionTrackingControl:false,showRoadLabels:true});this.panorama.addListener('position_changed',()=>{const p=this.panorama.getPosition();if(!p||!this.active)return;this.point=[p.lng(),p.lat()];this.updateNearby();});}
 this.panorama.setPano(result.data.location.pano);this.panorama.setPov({heading:stop.heading||0,pitch:0});this.panorama.setVisible(true);this.status('');
 }catch{if(request===this.request&&this.active)this.status(`<strong>Panorama non disponibile</strong><p>Controlla copertura, chiave, dominio autorizzato e fatturazione Google Maps.</p><a href="${mapsStreetURL(this.point)}" target="_blank" rel="noopener noreferrer">Apri il luogo reale ↗</a>`);}
 }
 updateNearby(){const nearby=nearbyProperties(this.catalog,this.point);this.nearby=nearby;const list=this.root.querySelector('.real-list');list.innerHTML=nearby.length?nearby.map(({p,distance})=>`<button data-property="${esc(p.id)}"><span>${esc(p.realName||p.label||'Proprietà')}</span><small>${Math.round(distance)} m · ${esc(this.describe(p.id).summary)}</small></button>`).join(''):'<p>Nessuna proprietà giocabile entro 100 m. Prova una delle altre tappe.</p>';for(const b of list.querySelectorAll('[data-property]'))b.onclick=()=>this.select(b.dataset.property);
 for(const m of this.markers)m.setMap(null);this.markers=[];if(this.panorama&&this.active)for(const {p}of nearby){const marker=new window.google.maps.Marker({map:this.panorama,position:{lat:p.center[1],lng:p.center[0]},title:p.realName||p.label,label:{text:'€',color:'#fff'},});marker.addListener('click',()=>this.select(p.id));this.markers.push(marker);}
 }
 select(id){this.selected=id;const q=this.describe(id),box=this.root.querySelector('.real-detail');box.hidden=false;box.innerHTML=`<h3>${esc(q.title)}</h3><p>${esc(q.detail)}</p><strong>${esc(q.cash)}</strong>${q.action?`<button class="primary" data-action>${esc(q.action)}</button>`:''}<small>Proprietà e operazioni solo virtuali.</small>`;const b=box.querySelector('[data-action]');if(b)b.onclick=()=>{try{this.act(id);this.updateNearby();this.select(id);}catch(e){let msg=box.querySelector('[role=status]');if(!msg){msg=document.createElement('p');msg.setAttribute('role','status');box.append(msg);}msg.textContent=e.message;}};}
}
