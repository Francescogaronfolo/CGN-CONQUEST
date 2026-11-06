// Independent CGN economy. Prototype uses game money and local AI, not real users.
export const START_CASH=12000,MANAGER_SHARE=.25;
export const BUSINESSES={services:{name:'Servizi da casa',base:1500,rate:90},shop:{name:'Commercio',base:3000,rate:180},workshop:{name:'Laboratorio',base:4800,rate:280},logistics:{name:'Logistica',base:3800,rate:220}};
export const COLORS=['#198b7d','#b7823c','#677da1','#aa6b65','#87789b','#75915b'];
export function createWorld(catalog,name='La mia impresa'){
 if(catalog.length<12||new Set(catalog.map(p=>p.id)).size!==catalog.length)throw Error('Catalogo geografico non valido.');
 const w={version:1,time:0,seq:0,players:[],companies:[],assets:{},offers:[],events:[],initial:START_CASH*6,earned:0,spent:0};
 const names=[String(name).trim().slice(0,28)||'La mia impresa','Naviglio Ventures','Corte Nord','Ticino Capital','Castelletto Lab','Borgo Partners'];
 const homes=catalog.filter(p=>p.homeCandidate&&!p.protected).sort((a,b)=>Math.hypot(a.center[0]-8.8158,a.center[1]-45.5064)-Math.hypot(b.center[0]-8.8158,b.center[1]-45.5064));if(homes.length<6)throw Error('Servono sei sedi residenziali.');
 for(let id=0;id<6;id++){
  const home=homes[Math.floor(id*(homes.length-1)/5)];
  w.players.push({id,name:names[id],cash:START_CASH,earned:0,spent:0,transfers:0,home:home.id,next:18+id*7});
  w.companies.push({id,name:names[id],manager:id,shares:{[id]:1},managerFee:0});
  w.assets[home.id]={id:home.id,company:id,level:id===0?0:1,business:'services',invested:1500,home:true};
 }
 return w;
}
export function grossIncome(w,company){return Object.values(w.assets).filter(a=>a.company===company).reduce((n,a)=>n+BUSINESSES[a.business].rate*a.level,0);}
export function income(w,player){let total=0;for(const c of w.companies){const gross=grossIncome(w,c.id),fee=gross*c.managerFee;total+=(c.manager===player?fee:0)+(gross-fee)*(c.shares[player]||0);}return total;}
export function value(w,company){return Math.round(Object.values(w.assets).filter(a=>a.company===company).reduce((n,a)=>n+1000+a.invested*.8,0)+grossIncome(w,company)*3);}
export function controller(c){return Number(Object.keys(c.shares).find(id=>c.shares[id]>.5)??c.manager);}
export function buildingQuote(w,catalog,id,player=0){
 const p=catalog.find(p=>p.id===id);if(!p)return{reason:'Edificio non disponibile nel gioco.'};
 const asset=w.assets[id];if(!asset&&p.protected)return{reason:'Luogo pubblico o patrimonio storico: consultabile, non acquistabile nel gioco.'};if(!asset)return{kind:'buy',cost:p.price,description:'Acquista una proprietà virtuale. La destinazione reale non cambia.'};
 const company=w.companies[asset.company];if(company.manager!==player)return{kind:'offer',company:company.id};
 if(asset.level>=8)return{reason:'Massimo sviluppo del prototipo.'};
 return{kind:'upgrade',cost:Math.round(BUSINESSES[asset.business].base*1.6**asset.level),delta:BUSINESSES[asset.business].rate};
}
function pay(w,player,amount){const p=w.players[player];if(!Number.isFinite(amount)||amount<0||p.cash+1e-8<amount)throw Error('Liquidità insufficiente.');p.cash-=amount;p.spent+=amount;w.spent+=amount;}
function event(w,text){w.events.unshift({id:++w.seq,text,at:w.time});w.events=w.events.slice(0,20);}
export function buy(w,catalog,player,id){
 const q=buildingQuote(w,catalog,id,player);if(q.kind!=='buy')throw Error('La proprietà richiede il consenso del titolare.');
 pay(w,player,q.cost);const p=catalog.find(p=>p.id===id);let company=w.companies.find(c=>c.manager===player&&(c.shares[player]||0)>.5);if(!company){company={id:w.companies.length,name:w.players[player].name+' · Nuova',manager:player,shares:{[player]:1},managerFee:0};w.companies.push(company);}w.assets[id]={id,company:company.id,level:0,business:p.business,invested:q.cost,home:false};event(w,'Nuova proprietà acquisita. Tocca Avvia per aprire l’attività.');
}
export function upgrade(w,catalog,player,id){
 const a=w.assets[id],q=buildingQuote(w,catalog,id,player);if(q.kind!=='upgrade')throw Error(q.reason||'Non gestisci questa proprietà.');
 pay(w,player,q.cost);a.level++;a.invested+=q.cost;event(w,a.level===1?'Attività avviata: le entrate cominciano a crescere.':'Attività al livello '+a.level+'.');
}
export function offerQuote(w,buyer,target,kind,share=.25){
 const c=w.companies[target];if(!c||c.manager===buyer)throw Error('Scegli un’altra impresa.');
 if(kind==='stake'){
  if(![.25,.49].includes(share)||(c.shares[c.manager]||0)-share<.51-1e-8)throw Error('L’associazione deve lasciare il controllo al gestore.');
  return {share,price:Math.ceil(value(w,target)*share*1.1),approvers:[c.manager]};
 }
 if(kind!=='acquire'||(c.shares[buyer]||0)===1)throw Error('Proposta non valida.');
 const approvers=[...new Set([...Object.keys(c.shares).map(Number),c.manager])].filter(id=>id!==buyer);
 return {share:1,price:Math.ceil(value(w,target)*(1-(c.shares[buyer]||0))*1.1),approvers};
}
export function propose(w,buyer,target,kind,price,share=.25){
 const q=offerQuote(w,buyer,target,kind,share);
 if(!Number.isSafeInteger(price)||price<1||price>1e9||w.players[buyer].cash<price)throw Error('Offerta non finanziabile.');
 if(w.offers.some(o=>o.target===target))throw Error('Questa impresa sta già valutando una proposta.');
 const c=w.companies[target],id=++w.seq;
 w.offers.push({id,buyer,target,kind,price,share:q.share,approvers:q.approvers,votes:{},capital:JSON.stringify(c.shares),expires:w.time+180,respondAt:w.time+6});
 event(w,'Proposta inviata. Le proprietà e il denaro cambiano solo con il consenso.');return id;
}
export function vote(w,player,id,accept){
 const o=w.offers.find(o=>o.id===id);if(!o||!o.approvers.includes(player)||Object.hasOwn(o.votes,player))throw Error('Non puoi votare questa proposta.');
 if(o.expires<=w.time)throw Error('Proposta scaduta.');
 if(!accept){w.offers=w.offers.filter(x=>x.id!==id);event(w,'Proposta rifiutata. Nessuna proprietà o somma trasferita.');return;}
 const votes={...o.votes,[player]:true};if(!o.approvers.every(id=>votes[id])){o.votes=votes;return;}
 const c=w.companies[o.target],payer=w.players[o.buyer];
 if(JSON.stringify(c.shares)!==o.capital)throw Error('Le quote sono cambiate: serve una nuova proposta.');
 if(payer.cash<o.price)throw Error('Il proponente non dispone più del capitale richiesto.');
 const recipients=o.kind==='stake'?{[c.manager]:1}:Object.fromEntries(Object.entries(c.shares).filter(([id])=>Number(id)!==o.buyer));
 const total=Object.values(recipients).reduce((a,b)=>a+b,0);if(total<=0)throw Error('Nessun socio cedente.');
 payer.cash-=o.price;payer.transfers-=o.price;
 for(const [id,weight]of Object.entries(recipients)){const amount=o.price*weight/total;w.players[id].cash+=amount;w.players[id].transfers+=amount;}
 if(o.kind==='stake'){c.shares[c.manager]-=o.share;c.shares[o.buyer]=(c.shares[o.buyer]||0)+o.share;}
 else{c.shares={[o.buyer]:1};c.managerFee=MANAGER_SHARE;}
 w.offers=w.offers.filter(x=>x.id!==id);
 event(w,o.kind==='stake'?'Associazione conclusa: quote e dividendi aggiornati.':'Acquisizione conclusa: il venditore resta gestore e riceve il 25% dell’utile operativo.');
}
export function step(w,seconds,catalog,{ai=true}={}){
 if(!Number.isFinite(seconds)||seconds<0||seconds>1)throw Error('Passo temporale non valido.');
 w.time+=seconds;
 for(const p of w.players){const earned=income(w,p.id)*seconds/60;p.cash+=earned;p.earned+=earned;w.earned+=earned;}
 for(const o of [...w.offers]){
  if(o.expires<=w.time){w.offers=w.offers.filter(x=>x.id!==o.id);continue;}
  if(ai&&o.respondAt<=w.time)for(const id of o.approvers.filter(id=>id!==0&&!o.votes[id])){
   if(!w.offers.some(x=>x.id===o.id))break;
   const fair=value(w,o.target)*(o.kind==='stake'?o.share:1-(w.companies[o.target].shares[o.buyer]||0));
   try{vote(w,id,o.id,o.price>=fair);}catch{w.offers=w.offers.filter(x=>x.id!==o.id);}
  }
 }
 if(ai)for(const p of w.players.slice(1)){
  if(w.time<p.next)continue;p.next=w.time+25+p.id*3;
  const assets=Object.values(w.assets).filter(a=>a.company===p.id&&a.level<8).sort((a,b)=>a.level-b.level);
  const candidate=assets[0];try{if(candidate&&buildingQuote(w,catalog,candidate.id,p.id).cost<p.cash*.5)upgrade(w,catalog,p.id,candidate.id);}catch{}
  if(w.time>90&&!w.offers.some(o=>o.target===0))try{const q=offerQuote(w,p.id,0,'stake');if(q.price<p.cash*.5)propose(w,p.id,0,'stake',q.price);}catch{}
 }
}
export function audit(w){return w.players.every(p=>Number.isFinite(p.cash)&&p.cash>=-1e-7&&Math.abs(p.cash-(START_CASH+p.earned-p.spent+p.transfers))<.01)&&Math.abs(w.players.reduce((n,p)=>n+p.cash,0)-(w.initial+w.earned-w.spent))<.02&&w.companies.every(c=>Math.abs(Object.values(c.shares).reduce((a,b)=>a+b,0)-1)<1e-8);}
export function restore(text,catalog){try{const w=JSON.parse(text);if(w.version!==1||w.players.length!==6||w.companies.length<6||w.companies.length>256||!audit(w)||!Array.isArray(w.offers)||!Number.isFinite(w.time)||w.time<0)return null;const ids=new Set(catalog.map(p=>p.id));if(w.players.some((p,i)=>p.id!==i||!ids.has(p.home)||typeof p.name!=='string'||p.name.length>28||![p.earned,p.spent,p.transfers,p.next].every(Number.isFinite)))return null;if(w.companies.some((c,i)=>c.id!==i||!w.players[c.manager]||![0,MANAGER_SHARE].includes(c.managerFee)||Object.entries(c.shares).some(([id,n])=>!w.players[id]||!Number.isFinite(n)||n<0||n>1)))return null;if(Object.entries(w.assets).some(([id,a])=>id!==a.id||!ids.has(id)||!Number.isInteger(a.level)||a.level<0||a.level>8||!BUSINESSES[a.business]||!w.companies[a.company]||!Number.isFinite(a.invested)||a.invested<0))return null;return w;}catch{return null;}}
