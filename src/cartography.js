// Geographic rendering and label placement are independent from the game economy.
export const CATEGORIES={residential:{name:'Abitazioni',fill:'#d8c8af',stroke:'#b3a38c'},industry:{name:'Industria e magazzini',fill:'#b6c3cb',stroke:'#8b9da7'},commerce:{name:'Attività e servizi',fill:'#dfc1a1',stroke:'#b48e68'},heritage:{name:'Patrimonio storico',fill:'#ccb28c',stroke:'#99774b'},civic:{name:'Servizi e luoghi pubblici',fill:'#c2bdcf',stroke:'#9890ac'},unknown:{name:'Edificio · uso non censito',fill:'#d6d0c3',stroke:'#b7b0a1'},green:{name:'Parchi e giardini',fill:'#b8cea5',stroke:'#91ae7c'}};
export function baseBuildingStyle(feature){const c=CATEGORIES[feature.properties.category]||CATEGORIES.unknown;return{color:c.stroke,fillColor:c.fill,fillOpacity:1,weight:.65,lineJoin:'round'};}
export function landStyle(p){if(p.natural==='water'||p.landuse==='reservoir')return{fillColor:'#a4c8ce',color:'#89b0b9',weight:1};if(p.natural==='wood'||p.landuse==='forest')return{fillColor:'#acc4a0',color:'#a1bc94',weight:.6};if(p.leisure==='park'||p.leisure==='garden')return{fillColor:'#c1d5ad',color:'#abc497',weight:.7};if(p.leisure==='pitch')return{fillColor:'#b2c8a3',color:'#e1ebd8',weight:1};if(p.landuse==='industrial')return{fillColor:'#d9dfe0',color:'#c7ced1',weight:.7};if(p.landuse==='commercial'||p.landuse==='retail')return{fillColor:'#e9decb',color:'#d9ceb7',weight:.6};if(p.landuse==='residential')return{fillColor:'#eee8dc',color:'#e2dccd',weight:.5};if(p.landuse==='farmland'||p.landuse==='farmyard'||p.landuse==='orchard')return{fillColor:'#e1e2c3',color:'#cfd4b5',weight:.6};return{fillColor:'#d4dfc1',color:'#c3d0ad',weight:.5};}
export function roadWidth(highway,zoom){const m={primary:12,secondary:10,tertiary:9,residential:6,unclassified:6,service:4,living_street:4,pedestrian:4,footway:1.5,cycleway:2,path:1.2,track:2};return Math.max(highway==='path'? .6:1,Math.min(18,(m[highway]||4)*2**(zoom-17)*.68));}
export function chooseLabels(candidates,project,bounds,zoom,filter='all'){
 const result=[],occupied=[];
 for(const c of candidates.slice().sort((a,b)=>b.priority-a.priority)){
  if(zoom<c.minZoom||filter==='business'&&c.kind==='poi'&&!['commerce','industry'].includes(c.category)||filter==='heritage'&&c.kind==='poi'&&!['heritage','civic','green'].includes(c.category))continue;
  const p=project(c.point);if(p.x<20||p.y<(bounds.width<600?180:150)||p.x>bounds.width-20||p.y>bounds.height-85)continue;
  const width=Math.min(c.name.length*5.6+(c.kind==='poi'?24:0),190),height=c.kind==='poi'?27:16;
  const box={x:p.x-width/2,y:p.y-height/2,w:width,h:height};
  if(occupied.some(b=>box.x<b.x+b.w+10&&box.x+box.w+10>b.x&&box.y<b.y+b.h+10&&box.y+box.h+10>b.y))continue;
  occupied.push(box);result.push(c);if(result.length>=(zoom<16?10:zoom<18?24:35))break;
 }
 return result;
}
export function installCartography(L,map,{geo,landscape,places,escape,onPlace}){
 const panes={land:210,water:230,roadBase:250,roads:260,shadow:280,buildings:300};
 for(const[name,z]of Object.entries(panes)){map.createPane(name);map.getPane(name).style.zIndex=z;}
 L.geoJSON(landscape,{pane:'land',interactive:false,style:f=>({...landStyle(f.properties),fillOpacity:.94})}).addTo(map);
 const waters=L.geoJSON(geo,{pane:'water',filter:f=>f.properties.kind==='water',interactive:false,style:f=>({color:'#99c1ca',weight:f.properties.waterway==='river'?18:6,opacity:1,lineCap:'round'})}).addTo(map);
 const roadGeo={type:'FeatureCollection',features:geo.features.filter(f=>f.properties.kind==='road')};
 const roadsBase=L.geoJSON(roadGeo,{pane:'roadBase',interactive:false,style:{color:'#c7c3b7',opacity:.9}}).addTo(map);
 const roads=L.geoJSON(roadGeo,{pane:'roads',interactive:false,style:{color:'#fffdf5'}}).addTo(map);
 const buildings=geo.features.filter(f=>f.properties.kind==='building'&&f.geometry.type==='Polygon');
 const shadows={type:'FeatureCollection',features:buildings.map(f=>({...f,geometry:{...f.geometry,coordinates:f.geometry.coordinates.map(r=>r.map(([x,y])=>[x+.000018,y-.000012]))}}))};
 L.geoJSON(shadows,{pane:'shadow',interactive:false,style:{stroke:false,fillColor:'#4b504c',fillOpacity:.17}}).addTo(map);
 const candidates=[],usedRoads=new Set();
 for(const p of places){candidates.push({...p,kind:'poi',minZoom:p.priority>=100?14:p.category==='heritage'?15:p.category==='industry'?16:17});}
 for(const f of roadGeo.features){const p=f.properties;if(!p.name||usedRoads.has(p.name)||f.geometry.type!=='LineString')continue;usedRoads.add(p.name);const pts=f.geometry.coordinates;const point=pts[Math.floor(pts.length/2)];candidates.push({id:f.id,name:p.name,point,kind:'road',category:'road',priority:8,minZoom:17});}
 for(const f of landscape.features){const p=f.properties;if(p.name&&['park','garden'].includes(p.leisure)){const pts=f.geometry.coordinates[0];candidates.push({id:f.id,name:p.name,point:[pts.reduce((s,p)=>s+p[0],0)/pts.length,pts.reduce((s,p)=>s+p[1],0)/pts.length],kind:'zone',category:'green',priority:20,minZoom:15});}}
 const labels=L.layerGroup().addTo(map);let filter='all';
 function draw(){const zoom=map.getZoom();roadsBase.eachLayer(l=>l.setStyle({weight:roadWidth(l.feature.properties.highway,zoom)+1.8}));roads.eachLayer(l=>{const p=l.feature.properties;const pedestrian=['footway','path','track','cycleway'].includes(p.highway);l.setStyle({weight:roadWidth(p.highway,zoom),color:pedestrian?'#e8e4d3':['primary','secondary'].includes(p.highway)?'#f6e5bf':'#fffdf6',dashArray:pedestrian?'3 4':null,fillOpacity:.9,fillColor:'#e9e3d4'});});waters.eachLayer(l=>l.setStyle({weight:Math.max(1,Math.min(55,(l.feature.properties.waterway==='river'?35:9)*2**(zoom-17)))}));
  labels.clearLayers();const size=map.getSize();for(const p of chooseLabels(candidates,point=>map.latLngToContainerPoint([point[1],point[0]]),{width:size.x,height:size.y},zoom,filter)){
   const html=p.kind==='poi'?`<span class="poi-dot ${p.category}"></span><span>${escape(p.name)}</span>`:escape(p.name);
   const marker=L.marker([p.point[1],p.point[0]],{icon:L.divIcon({className:'map-label '+p.kind+' '+p.category,html:`<span class="label-body">${html}</span>`,iconSize:[0,0]}),interactive:p.kind==='poi',keyboard:p.kind==='poi',title:p.name});
   if(p.kind==='poi')marker.on('click',()=>onPlace(p));marker.addTo(labels);
  }
 }
 map.on('zoomend moveend resize',draw);draw();
 return{setFilter(value){filter=value;draw();},refresh:draw};
}
