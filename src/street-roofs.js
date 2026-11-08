import * as T from '../vendor/three/three.module.js';
export function clipHalf(points,axis,value,positive){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],inside=p=>positive?p[axis]>=value:p[axis]<=value,A=inside(a),B=inside(b);if(A)out.push(a);if(A!==B){const t=(value-a[axis])/(b[axis]-a[axis]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;}
export function pitchedRoofGeometry(outline,height){
 const points=outline.slice(0,-1),xs=points.map(p=>p[0]),zs=points.map(p=>p[1]),w=Math.max(...xs)-Math.min(...xs),d=Math.max(...zs)-Math.min(...zs),axis=w>d?1:0,minimum=axis?Math.min(...zs):Math.min(...xs),span=axis?d:w,mid=minimum+span/2,rise=Math.min(2.7,span*.22),positions=[],uv=[];
 const put=p=>{positions.push(p[0],height+.06+Math.max(0,1-Math.abs(p[axis]-mid)/(span/2||1))*rise,p[1]);uv.push(p[0]/2,p[1]/2);};
 const triangles=T.ShapeUtils.triangulateShape(points.map(p=>new T.Vector2(...p)),[]);
 for(const tri of triangles)for(const positive of [false,true]){const poly=clipHalf(tri.map(i=>points[i]),axis,mid,positive);for(let i=1;i<poly.length-1;i++){put(poly[0]);put(poly[i]);put(poly[i+1]);}}
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],edge=[a];if((a[axis]<mid&&b[axis]>mid)||(a[axis]>mid&&b[axis]<mid)){const t=(mid-a[axis])/(b[axis]-a[axis]);edge.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}edge.push(b);const low=p=>{positions.push(p[0],height,p[1]);uv.push(p[0]/2,p[1]/2);};for(let j=1;j<edge.length;j++){low(edge[j-1]);low(edge[j]);put(edge[j]);low(edge[j-1]);put(edge[j]);put(edge[j-1]);}}
 for(let i=0;i<positions.length;i+=9){const ax=positions[i+3]-positions[i],az=positions[i+5]-positions[i+2],bx=positions[i+6]-positions[i],bz=positions[i+8]-positions[i+2];if(az*bx-ax*bz<0){for(let j=0;j<3;j++)[positions[i+3+j],positions[i+6+j]]=[positions[i+6+j],positions[i+3+j]];const u=i/3*2;for(let j=0;j<2;j++)[uv[u+2+j],uv[u+4+j]]=[uv[u+4+j],uv[u+2+j]];}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
