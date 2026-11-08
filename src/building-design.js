// Visual archetypes, not reconstructions of unmeasured real architecture.
export function buildingDesign(properties,place){
 const name=(place?.name||properties.name||'').toLowerCase();
 if(/villa annoni/.test(name))return 'villa';
 if(/palazzo clerici|casa clerici/.test(name))return 'palace';
 if(properties.building==='church'||properties.building==='chapel'||/chiesa|oratorio/.test(name))return 'church';
 if(place?.tags?.amenity==='townhall'||properties.amenity==='townhall'||/comune di/.test(name))return 'townhall';
 if(properties.category==='heritage')return 'monument';
 if(properties.category==='industry')return 'factory';
 if(properties.category==='commerce')return 'shop';
 if(properties.category==='civic')return 'public';
 return 'home';
}
export function coastVelocity(v,elapsed){return v*Math.exp(-Math.min(elapsed,64)/180);}

export function drawBuildingDetails(c,{design,roof,base,scale,path}){
 const xs=roof.map(p=>p.x),ys=roof.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
 if(w<7||h<4)return;
 // Roof graphics stay clipped to the actual inset footprint.
 c.save();c.clip(path);
 if(design==='home'){
  c.fillStyle='#f3dfba66';c.beginPath();c.moveTo(x,y);c.lineTo(x+w*.5,y+h*.5);c.lineTo(x+w,y);c.fill();c.strokeStyle='#aa805b';c.lineWidth=.7;c.beginPath();c.moveTo(x,y+h*.5);c.lineTo(x+w,y+h*.5);c.stroke();
 }else if(design==='factory'){
  c.fillStyle='#91a8ae';c.fillRect(x,y,w,h);c.strokeStyle='#e4eeee';c.lineWidth=Math.max(1,scale*.7);for(let k=x;k<x+w;k+=Math.max(7,scale*5)){c.beginPath();c.moveTo(k,y);c.lineTo(k+8,h+y);c.stroke();}c.fillStyle='#5f7d89';for(let k=x+5;k<x+w-4;k+=15)c.fillRect(k,y+h*.3,7,Math.min(4,h*.2));
 }else if(design==='shop'){
  c.fillStyle='#e3c8a1';c.fillRect(x,y,w,h);c.fillStyle='#8ab5b4';c.fillRect(x+w*.2,y+h*.25,w*.6,Math.max(2,h*.25));
 }else{
  c.fillStyle=design==='church'?'#b795a0':design==='public'?'#bec8ce':'#e4c9a0';c.fillRect(x,y,w,h);c.strokeStyle='#fff7db';c.lineWidth=Math.max(1,scale);c.strokeRect(x+3,y+3,Math.max(1,w-6),Math.max(1,h-6));
  if(['villa','palace','townhall'].includes(design)){c.fillStyle='#b69d75';c.fillRect(x+w*.3,y+h*.3,w*.4,h*.4);}
 }
 c.restore();
 // Detail the most visible front wall; buildings remain recognisable when owned.
 let index=0;for(let i=1;i<base.length-1;i++)if((base[i].y+base[i+1].y)>(base[index].y+base[index+1].y))index=i;
 const a=roof[index],b=roof[index+1],ga=base[index],gb=base[index+1],length=Math.hypot(a.x-b.x,a.y-b.y);
 if(length>12&&Math.abs(ga.y-a.y)>4){
  const columns=['villa','palace','townhall','monument'].includes(design),count=Math.min(12,Math.floor(length/(columns?6:8)));
  for(let i=1;i<count;i++){const t=i/count,px=a.x+(b.x-a.x)*t,py=a.y+(b.y-a.y)*t;
   c.strokeStyle=columns?'#fff3d6':design==='shop'?'#427d82':'#678b91';c.lineWidth=columns?2:2.3;c.beginPath();c.moveTo(px,py+2);c.lineTo(px+(ga.x-a.x)*.6,py+(ga.y-a.y)*.72);c.stroke();
  }
  if(design==='shop'){c.strokeStyle='#c86c46';c.lineWidth=Math.max(3,scale*2);c.beginPath();c.moveTo(a.x,a.y+2);c.lineTo(b.x,b.y+2);c.stroke();}
 }
 const top=roof.reduce((a,b)=>b.y<a.y?b:a,roof[0]);
 if(['church','factory','townhall','villa','palace','monument'].includes(design)&&scale>.6){
  const tower=design==='church'?14:design==='factory'?12:8,tx=top.x,ty=top.y;
  c.fillStyle=design==='factory'?'#72868a':'#c8b28b';c.fillRect(tx-3,ty-tower,6,tower);c.fillStyle='#897c66';c.fillRect(tx-3,ty-tower,6,2);
  if(design==='church'){c.strokeStyle='#786449';c.lineWidth=1.3;c.beginPath();c.moveTo(tx,ty-tower-7);c.lineTo(tx,ty-tower);c.moveTo(tx-3,ty-tower-5);c.lineTo(tx+3,ty-tower-5);c.stroke();}
  if(design==='townhall'||design==='villa'){c.strokeStyle='#7b8972';c.beginPath();c.moveTo(tx,ty-tower);c.lineTo(tx,ty-tower-12);c.stroke();c.fillStyle='#448d73';c.fillRect(tx,ty-tower-12,4,6);c.fillStyle='#fff';c.fillRect(tx+4,ty-tower-12,4,6);c.fillStyle='#c56b5b';c.fillRect(tx+8,ty-tower-12,4,6);}
 }
}
