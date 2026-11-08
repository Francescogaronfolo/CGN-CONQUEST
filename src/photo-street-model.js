// Photo facade bindings are interpretative game associations, not verified
// property boundaries. Never bind protected public/heritage assets.
export const PHOTO_SCENES=[
 {id:'ponte',name:'Castelletto · lungo il Naviglio',file:'assets/photo-street/ponte.jpg',width:4032,height:3024,point:[8.7925983,45.4943107],year:'2021',author:'Betty Lassini',license:'CC BY-SA 4.0',licenseURL:'https://creativecommons.org/licenses/by-sa/4.0/',source:'https://commons.wikimedia.org/wiki/File:Cuggiono_-_Ponte_sul_Naviglio_Grande_-_202109040735.jpeg',next:'borgo',focus:[.36,.47],
  sites:[
   {id:'osm-way-1532419634',label:'Casa sul Naviglio',polygon:[[0,.32],[.112,.36],[.112,.52],[0,.52]],anchor:[.058,.47]},
   {id:'osm-way-402404396',label:'Attività sul lungofiume',polygon:[[.26,.37],[.367,.38],[.414,.42],[.414,.51],[.26,.51]],anchor:[.337,.46]},
   {id:'osm-way-1532419959',label:'Sede sull’alzaia',polygon:[[.812,.445],[.838,.435],[.858,.449],[.858,.539],[.812,.535]],anchor:[.835,.49]}
  ]},
 {id:'borgo',name:'Castelletto · il borgo',file:'assets/photo-street/borgo.jpg',width:1000,height:665,point:[8.795999,45.497440],year:'2007',author:'tampe / Fabrizio Tampellini',license:'CC BY-SA 3.0',licenseURL:'https://creativecommons.org/licenses/by-sa/3.0/',source:'https://commons.wikimedia.org/wiki/File:Castelletto_di_Cuggiono_-_panoramio.jpg',next:'ponte',focus:[.12,.55],
  sites:[{id:'osm-way-1532419901',label:'Casa del borgo',polygon:[[0,.35],[.105,.39],[.115,.67],[0,.705]],anchor:[.06,.55]}]}
];
export function photoLayout(width,height,scene,zoom=1){const scale=Math.max(width/scene.width,height/scene.height)*zoom;return{width:scene.width*scale,height:scene.height*scale};}
export function clampPhotoOffset(x,y,layout,viewport){return{x:Math.max(viewport.width-layout.width,Math.min(0,x)),y:Math.max(viewport.height-layout.height,Math.min(0,y))};}
export function photoSites(scene,catalog){return scene.sites.filter(s=>catalog.some(p=>p.id===s.id&&!p.protected));}
