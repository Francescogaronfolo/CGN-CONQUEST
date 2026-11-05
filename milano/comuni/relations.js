import {COMUNI} from './data.js?v=1';
import {COLORS,standings} from './engine.js?v=1';
import {relationship,pendingAlliance} from './interaction.js?v=1';
const num=n=>Math.floor(n).toLocaleString('it-IT');
export function createRelations({element,getGame,onLocate,onTrade,onAlliance,onInbox,onClose}){
 let key='',filter='all';
 const node=(tag,text,cls='')=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;e.className=cls;return e;};
 const button=(label,fn,cls='')=>{const b=node('button',label,cls);b.onclick=fn;return b;};
 function render(){
  const g=getGame(),scroll=element.querySelector('.relationsList')?.scrollTop||0;
  const heading=node('div',undefined,'managementHeading'),title=node('div');title.append(node('small','LE ALTRE IMPRESE'),node('h2','Società & accordi'));const exit=button('×',onClose);exit.setAttribute('aria-label','Chiudi società e accordi');heading.append(title,exit);
  const tabs=node('div',undefined,'relationTabs');for(const [value,label]of [['all','Tutte'],['ally','Alleati']]){const b=button(label,()=>{filter=value;render();});b.setAttribute('aria-pressed',filter===value);tabs.append(b);}const incoming=g.offers.filter(o=>o.to===0).length;tabs.append(button('Proposte'+(incoming?' · '+incoming:''),onInbox,incoming?'primary':''));
  const list=node('div',undefined,'relationsList');
  for(const row of standings(g).filter(r=>r.id!==0)){
   const rel=relationship(g,row.id),pending=pendingAlliance(g,row.id);if(filter==='ally'&&rel!=='ally')continue;
   const card=node('section',undefined,'companyCard'),head=node('div',undefined,'companyIdentity'),dot=node('i',undefined,'companyDot');dot.style.background=COLORS[row.id];
   const name=node('strong',row.name);head.append(dot,name,node('span',rel==='ally'?'Alleato':rel==='trade'?'Passaggio attivo':'Concorrente','relationBadge '+rel));
   const home=g.cities[row.home]?.owner===row.id?row.home:g.cities.find(c=>c.owner===row.id)?.id;
   card.append(head,node('p',num(row.cash)+' € disponibili · +'+num(row.income)+' €/min','companyFigures'),node('small',row.cities+(row.cities===1?' comune · ':' comuni · ')+(COMUNI[home]?.name||'Nessuna sede')));
   const actions=node('div',undefined,'companyActions');actions.append(button('⌖ Sulla mappa',()=>onLocate(row.id)),button('Scambia',()=>onTrade(row.id)));
   if(rel==='ally')actions.append(node('span','↔ Passaggio reciproco · +5% entrate','allianceNote'));
   else if(pending)actions.append(button(pending.to===0?'Rispondi alla proposta':'Proposta inviata',onInbox));
   else actions.append(button('Alleati · +5%',()=>onAlliance(row.id),'primary'));
   card.append(actions);list.append(card);
  }
  if(!list.children.length)list.append(node('p','Nessun alleato. Apri “Tutte” e proponi una collaborazione.','managementEmpty'));
  const note=node('p','Gli accordi richiedono consenso. Cassa e proprietà rimangono separate.','relationsFootnote');
  element.replaceChildren(heading,tabs,list,note);list.scrollTop=scroll;key=signature();
 }
 function signature(){const g=getGame();return JSON.stringify([filter,g.players.map(p=>[p.id,Math.floor(p.cash/50)]),g.cities.map(c=>c.owner),g.offers.map(o=>o.id),g.treaties.map(t=>t.id)]);}
 return {open(){element.hidden=false;render();},close(){element.hidden=true;},refresh(){if(!element.hidden&&key!==signature()&&!element.contains(document.activeElement))render();}};
}
