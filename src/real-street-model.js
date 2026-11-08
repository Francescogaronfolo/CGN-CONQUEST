export const REAL_STREET_STOPS=[
 {name:'Piazza San Giorgio',point:[8.8156302,45.5063821],heading:270},
 {name:'Villa Annoni',point:[8.8163565,45.5046627],heading:160},
 {name:'Naviglio · Castelletto',point:[8.7925983,45.4943107],heading:0}
];
export function distanceMetres(a,b){const lat=(a[1]+b[1])*Math.PI/360;return Math.hypot((a[0]-b[0])*111320*Math.cos(lat),(a[1]-b[1])*111320);}
export function nearbyProperties(catalog,point,limit=8){return catalog.map(p=>({p,distance:distanceMetres(p.center,point)})).filter(x=>!x.p.protected&&x.distance<=100).sort((a,b)=>a.distance-b.distance||String(a.p.id).localeCompare(String(b.p.id))).slice(0,limit);}
export function mapsStreetURL(point){return 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+encodeURIComponent(point[1]+','+point[0]);}
