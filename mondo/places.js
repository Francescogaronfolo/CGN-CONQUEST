// A compressed, authored map of actual local references, not a 1:1 survey.
export const BOUNDS={left:-130,right:87,top:-104,bottom:111};
export const CANAL={left:-104,right:-94,top:10,bottom:105};
export const BRIDGES=[{x:-99,z:70,width:8,length:23}];
export const ROADS=[
 {points:[[-42,0],[42,0]],width:6},{points:[[0,-90],[0,33]],width:6},
 {points:[[-38,23],[39,23]],width:4.7},
 {points:[[-63,-38],[73,-38]],width:5},{points:[[73,-65],[73,-17],[39,-17],[39,23]],width:4.5},
 {points:[[30,-49],[30,-38]],width:3.2},
 {points:[[-63,-89],[-18,-89],[-18,-42],[-63,-42],[-63,-89]],width:4.6},
 {points:[[-18,-62],[0,-62]],width:4},{points:[[-63,-60],[-54,-60]],width:3},
 {points:[[-24,-54],[-18,-54]],width:3},{points:[[-41,-85],[-41,-89]],width:3},
 {points:[[-36,23],[-36,70]],width:4.7},
 {points:[[25,23],[25,94]],width:4.7},
 {points:[[-121,70],[25,70]],width:5},
 {points:[[-36,23],[-60,23],[-60,51],[-88,51]],width:4.2},
 {points:[[-112,17],[-112,99]],width:3.6},
 {points:[[-39,70],[-39,75]],width:3},{points:[[-13,65],[-13,70]],width:3}
];
export const PUBLIC_SITES=[
 {id:'san-giorgio',name:'San Giorgio',type:'church',x:7,z:-25,w:13,d:13,door:[7,-16],description:'La basilica e il campanile sono il riferimento del centro. Luogo pubblico da visitare.',source:'https://www.lombardiabeniculturali.it/architetture/schede/MI230-00067/'},
 {id:'annoni',name:'Villa Annoni e parco',type:'villa',x:4,z:44,w:23,d:12,door:[4,35],description:'Villa Annoni, sede del Comune, e il suo parco: il cuore monumentale di Cuggiono.',source:'https://comune.cuggiono.mi.it/luoghi/2707123/villa-annoni'},
 {id:'clerici',name:'Palazzo Clerici · il Castello',type:'palace',x:-77,z:37,w:22,d:16,door:[-90,37],description:'Il grande palazzo di Castelletto, con giardini a terrazze e scalinata sul Naviglio. Qui è reinterpretato nello stile del mondo.',source:'https://comune.cuggiono.mi.it/luoghi/2270030/frazione-castelletto'},
 {id:'ponte',name:'Ponte di Castelletto',type:'bridge',x:-99,z:70,w:23,d:8,solid:false,door:[-112,70],description:'Il passaggio fra le due sponde del Naviglio. Puoi attraversarlo a piedi.',source:'https://comune.cuggiono.mi.it/luoghi/2270030/frazione-castelletto'},
 {id:'naviglio',name:'Naviglio Grande',type:'water',x:-99,z:30,w:10,d:38,solid:false,door:[-90,30],description:'Il canale e l’alzaia collegano il paesaggio di Castelletto. L’acqua si attraversa dal ponte, non camminandoci sopra.',source:'https://comune.cuggiono.mi.it/luoghi/2270030/frazione-castelletto'},
 {id:'ospedale',name:'Ospedale di Cuggiono',type:'hospital',x:56,z:-52,w:23,d:17,door:[56,-41],description:'Il presidio ospedaliero di via Badi, reinterpretato come complesso riconoscibile con ingresso e parcheggio.',source:'https://asst-ovestmi.it/ospedalecuggiono'},
 {id:'carabinieri',name:'Stazione Carabinieri',type:'police',x:30,z:-57,w:14,d:12,door:[30,-48],description:'La stazione dei Carabinieri è uno dei riferimenti dei servizi del paese. Luogo pubblico, non acquistabile.',source:'https://comune.cuggiono.mi.it/documenti/2269698/numeri-utili'},
 {id:'oratorio',name:'Oratorio San Giovanni Bosco',type:'oratory',x:-49,z:34,w:15,d:12,door:[-39,34],description:'L’oratorio con il cortile e il campo sportivo, ispirato al complesso di via Cicogna.',source:'https://www.csi.milano.it/albo/campigara/oratorio-san-giovanni-bosco-via-c-cicogna-8-cuggiono-mi-4090.html'},
 {id:'primaria',name:'Scuola primaria A. M. Mozzoni',type:'school',x:-40,z:83,w:20,d:12,door:[-40,74],description:'La scuola primaria e il cortile: un piccolo polo scolastico nel settore sud della mappa.',source:'https://www.openstreetmap.org/way/584653963'},
 {id:'secondaria',name:'Scuola secondaria C. Fossati',type:'school',x:-13,z:59,w:18,d:11,door:[-13,67],description:'La scuola secondaria, vicina al parco e collegata alla strada del polo scolastico.',source:'https://www.openstreetmap.org/way/584653962'},
 {id:'gualdoni',name:'Piazza Gualdoni',type:'square',x:-27,z:-25,w:15,d:12,solid:false,door:[-23,-25],description:'Una seconda piazza del centro, con sedute e spazio pedonale.',source:'https://www.openstreetmap.org/way/1529766150'},
 {id:'castelletto',name:'Piazza Castelletto',type:'square',x:-78,z:51,w:19,d:10,solid:false,door:[-87,51],description:'Il piccolo spazio del borgo tra il palazzo, l’alzaia e le attività commerciali.',source:'https://www.lombardiabeniculturali.it/architetture/schede/MI100-02823/'},
 {id:'chiesa-castelletto',name:'Santi Giacomo e Filippo',type:'chapel',x:-75,z:86,w:11,d:12,door:[-75,77],description:'La chiesa del borgo di Castelletto, riconoscibile per la facciata e il piccolo campanile.',source:'https://www.openstreetmap.org/way/584654000'}
];
export function districtAt([x,z]){if(x<-65&&z>8)return'Castelletto · Naviglio';if(z<-42&&x<0)return'Zona industriale';if(z<-30&&x>15)return'Servizi · via Badi';if(z>58&&x>-66)return'Polo scolastico';if(z>30&&x>-20)return'Villa Annoni · parco';return'Centro di Cuggiono';}
export function overviewHeight(aspect){return Math.max(184,245/aspect)*1.08;}

export function groundHeight(x,z){if(x>-111&&x<-87&&Math.abs(z-70)<3.9)return .2;if(x>-92&&x<-88&&Math.abs(z-37)<3)return Math.max(0,(x+92)*.4);return 0;}
