// A deliberately simplified playable district, inspired by central Cuggiono.
// Private businesses and property values are fictional; this is not a 1:1 survey.
export const START_CASH=8000,MAX_LEVEL=6;
export const SITES=[
 {id:'casa',name:'La tua casa',type:'home',x:-10,z:9,w:8,d:7,door:[-10,3],price:1600,rate:70,color:'#e8d6b5'},
 {id:'bottega',name:'Bottega del Centro',type:'shop',x:-12,z:-9,w:8,d:7,door:[-12,-3],price:2100,rate:120,color:'#dfb778'},
 {id:'caffe',name:'Caffè della Piazza',type:'cafe',x:11,z:-9,w:8,d:7,door:[11,-3],price:2500,rate:145,color:'#cf9279'},
 {id:'atelier',name:'Atelier Annoni',type:'workshop',x:-27,z:-9,w:10,d:8,door:[-27,-3],price:3600,rate:205,color:'#c3cabc'},
 {id:'mercato',name:'Emporio del Borgo',type:'shop',x:26,z:-9,w:9,d:8,door:[26,-3],price:2900,rate:165,color:'#dfd4b7'},
 {id:'officina',name:'Officina Ticino',type:'workshop',x:-28,z:9,w:10,d:8,door:[-28,3],price:3900,rate:225,color:'#ba9b83'},
 {id:'studio',name:'Studio della Corte',type:'office',x:25,z:9,w:9,d:8,door:[25,3],price:4200,rate:245,color:'#b0c8c4'},
 {id:'corte',name:'Case della Corte',type:'home',x:-12,z:26,w:9,d:8,door:[-5,26],price:3100,rate:175,color:'#e3cba7'},
 {id:'logistica',name:'Deposito del Naviglio',type:'logistics',x:25,z:27,w:12,d:9,door:[17,27],price:4700,rate:280,color:'#a7b5ad'},
 {id:'sede',name:'Palazzo delle Imprese',type:'office',x:-28,z:27,w:11,d:9,door:[-20,27],price:5400,rate:325,color:'#d3c7b4'}
];
export const PUBLIC_SITES=[
 {id:'san-giorgio',name:'San Giorgio',x:7,z:-25,w:13,d:13},
 {id:'annoni',name:'Villa Annoni',x:4,z:44,w:23,d:12}
];
export const BOUNDS={left:-45,right:45,top:-38,bottom:56};
export function createState(){return{version:1,cash:START_CASH,earned:0,spent:0,levels:{casa:1},position:[-4,6]};}
export function siteIncome(site,level){return level?Math.round(site.rate*level*(1+.09*(level-1))):0;}
export function income(state){return SITES.reduce((n,s)=>n+siteIncome(s,state.levels[s.id]||0),0);}
export function quote(state,id){const site=SITES.find(s=>s.id===id);if(!site)throw Error('Questo luogo pubblico si può visitare.');const level=state.levels[id]||0;if(level>=MAX_LEVEL)return{kind:'max',level,rate:siteIncome(site,level),cost:0,delta:0};return{kind:level?'upgrade':'buy',level,cost:level?Math.round(site.price*.58*1.55**(level-1)):site.price,rate:siteIncome(site,level),delta:siteIncome(site,level+1)-siteIncome(site,level)};}
export function invest(state,id){const q=quote(state,id);if(q.kind==='max')throw Error('Sviluppo massimo del quartiere campione.');if(state.cash<q.cost)throw Error('Servono ancora '+Math.ceil(q.cost-state.cash).toLocaleString('it-IT')+' €.');state.cash-=q.cost;state.spent+=q.cost;state.levels[id]=q.level+1;return quote(state,id);}
export function step(state,seconds){if(!Number.isFinite(seconds)||seconds<0||seconds>1)throw Error('Tempo non valido.');const amount=income(state)*seconds/60;state.cash+=amount;state.earned+=amount;}
export function restore(text){try{const s=JSON.parse(text);if(s?.version!==1||![s.cash,s.earned,s.spent].every(n=>Number.isFinite(n)&&n>=0)||Math.abs(s.cash-(START_CASH+s.earned-s.spent))>.02||!s.levels||typeof s.levels!=='object'||Array.isArray(s.levels)||(!Number.isInteger(s.levels.casa)||s.levels.casa<1))return null;if(Object.entries(s.levels).some(([id,l])=>!SITES.some(p=>p.id===id)||!Number.isInteger(l)||l<1||l>MAX_LEVEL))return null;if(!Array.isArray(s.position)||s.position.length!==2||!s.position.every(Number.isFinite))s.position=[-4,6];if(!walkable(s.position[0],s.position[1]))s.position=[-4,6];return s;}catch{return null;}}
export function walkable(x,z,padding=.65){if(x*x+z*z<2.2**2)return false;if(x<BOUNDS.left+1||x>BOUNDS.right-1||z<BOUNDS.top+1||z>BOUNDS.bottom-1)return false;return![...SITES,...PUBLIC_SITES].some(s=>Math.abs(x-s.x)<s.w/2+padding&&Math.abs(z-s.z)<s.d/2+padding);}
const GRID=1.25,key=(x,z)=>x+','+z,cell=p=>p.map(n=>Math.round(n/GRID));
function nearestOpen(point){const [x,z]=cell(point);for(let radius=0;radius<12;radius++)for(let dz=-radius;dz<=radius;dz++)for(let dx=-radius;dx<=radius;dx++){if(radius&&Math.abs(dx)!==radius&&Math.abs(dz)!==radius)continue;if(walkable((x+dx)*GRID,(z+dz)*GRID))return[x+dx,z+dz];}return null;}
export function findPath(from,to){
 const start=nearestOpen(from),end=nearestOpen(to);if(!start||!end)return[];const target=key(...end),first=key(...start),open=new Map([[first,{p:start,g:0,f:0}]]),visited=new Set(),parents=new Map();
 for(let limit=0;open.size&&limit<8000;limit++){
  let current;for(const item of open.values())if(!current||item.f<current.f)current=item;const k=key(...current.p);open.delete(k);if(k===target){const result=[];let at=k;while(at!==first){const [x,z]=at.split(',').map(Number);result.unshift([x*GRID,z*GRID]);at=parents.get(at);if(!at)return[];}return result;}
  visited.add(k);for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const [x,z]=current.p,nx=x+dx,nz=z+dz,nk=key(nx,nz);if(visited.has(nk)||!walkable(nx*GRID,nz*GRID))continue;if(dx&&dz&&(!walkable((x+dx)*GRID,z*GRID)||!walkable(x*GRID,(z+dz)*GRID)))continue;const g=current.g+Math.hypot(dx,dz);if(open.has(nk)&&open.get(nk).g<=g)continue;parents.set(nk,k);open.set(nk,{p:[nx,nz],g,f:g+Math.hypot(end[0]-nx,end[1]-nz)});}
 }
 return[];
}
