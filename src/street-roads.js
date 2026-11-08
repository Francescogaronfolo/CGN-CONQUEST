// Continuous flat road ribbons: shared vertices, rounded joins and end caps.
export function roadProfile(p){
 const parsed=Number.parseFloat(p.width),walk=['footway','path','pedestrian','steps','cycleway'].includes(p.highway);
 const width=Number.isFinite(parsed)?Math.max(.8,Math.min(14,parsed)):walk?1.8:['primary','secondary','tertiary'].includes(p.highway)?6.8:p.highway==='service'?3.5:5;
 return{width,walk,kind:walk?'paving':['unpaved','gravel','dirt','ground'].includes(p.surface)?'earth':'asphalt'};
}
export function ribbonTriangles(line,width,y=0){
 const positions=[],uv=[];const tri=(a,b,c)=>{if((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])>0)[b,c]=[c,b];for(const p of[a,b,c]){positions.push(p[0],y,p[1]);uv.push(p[0]/8,p[1]/8);}};
 const points=line.filter((p,i)=>!i||Math.hypot(p[0]-line[i-1][0],p[1]-line[i-1][1])>.001);
 if(points.length<2)return{positions,uv};
 const half=width/2;
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/length*half,nz=(b[0]-a[0])/length*half,A=[a[0]+nx,a[1]+nz],B=[b[0]+nx,b[1]+nz],C=[b[0]-nx,b[1]-nz],D=[a[0]-nx,a[1]-nz];tri(A,B,C);tri(A,C,D);}
 // The same circular patch closes both sides of every bend and each endpoint.
 for(const p of points)for(let i=0;i<12;i++){const a=i*Math.PI/6,b=(i+1)*Math.PI/6;tri(p,[p[0]+Math.cos(a)*half,p[1]+Math.sin(a)*half],[p[0]+Math.cos(b)*half,p[1]+Math.sin(b)*half]);}
 return{positions,uv};
}
export function facadePalette(id,category){
 let hash=0;for(const ch of id)hash=(hash*31+ch.charCodeAt(0))>>>0;
 if(category==='heritage')return'#dec58e';if(category==='civic')return'#d8cbbb';if(category==='industry')return'#b9bcb3';
 return['#e2d4bc','#e6d9bc','#c9846b','#dec394','#d5b899','#e7dfcf','#d6c7b2'][hash%7];
}
export function distanceToSegment(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t);}
