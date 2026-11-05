// Orthographic urban footprints, original canvas cartography. No perspective.
export function paintBuilding(c,b,x,y,w,h,ghost=false){if(Math.min(w,h)<3)return;const level=Math.max(1,Math.min(8,b.level||1)),tier=level>=6?2:level>=3?1:0;c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.translate(x,y);c.scale(w/100,h/100);if(ghost)c.globalAlpha*=.45;
 const rect=(x,y,w,h,fill,stroke=null)=>{c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=.8;c.strokeRect(x,y,w,h);}};
 const line=(x,y,xx,yy,color,width=.8)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
 const circle=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
 const roof=(x,y,w,h,fill='#d9d3c7')=>{rect(x,y,w,h,fill,'#b9c0b9');line(x+1,y+1,x+w-1,y+1,'#ffffff99');};
 const tree=(x,y)=>circle(x,y,2.4,'#a4c59d');
 rect(0,0,100,100,b.type==='housing'?'#e8eddf':'#e8ebe7');rect(1,89,98,10,'#f7f8f5');
 if(b.type==='housing'){
  rect(7,7,86,75,'#e0ead9');const count=tier===0?3:tier===1?5:7,positions=[[9,10,30,25],[56,10,32,25],[10,51,28,27],[57,51,31,27],[10,37,28,10],[57,38,31,9],[41,12,10,65]];
  for(let i=0;i<count;i++){const r=positions[i];roof(...r,tier===2?'#d2d6ce':'#ded8cc');if(i%2===0)rect(r[0]+4,r[1]+5,r[2]-8,3,'#cacfc6');}for(const p of [[47,10],[47,75],[8,42],[91,42]])tree(...p);line(45,19,45,84,'#f8faf5',5);
 }
 if(b.type==='industry'){
  roof(8,9,82,45,tier===2?'#c3d1d1':'#d1d9d6');for(let i=0;i<3+tier;i++)rect(13+i*14,15,9,28,'#b4c7c9');roof(8,61,36,19,'#cdd5d1');for(let i=0;i<level+1;i++)rect(51+i%4*10,61+Math.floor(i/4)*9,7,6,['#b6c8c5','#d4c5ad','#bcc7d4'][i%3]);line(8,85,92,85,'#ced6d0',1);
 }
 if(b.type==='commerce'){
  roof(9,10,81,65,tier===2?'#c9d5d0':'#e2d8bd');rect(22,23,55,31,'#eff2e9');if(tier>0){roof(25,26,20,25,'#c0cfcd');roof(51,26,23,25,'#c0cfcd');}for(let i=0;i<4+tier;i++)rect(13+i*13,70,9,6,'#c9bda0');for(let x=15;x<90;x+=15)tree(x,84);
 }
 if(b.type==='energy'){
  roof(8,9,27,32,'#c9d5ce');const cols=tier+2,rows=tier+2;for(let yy=0;yy<rows;yy++)for(let xx=0;xx<cols;xx++)rect(44+xx*46/cols,10+yy*64/rows,46/cols-3,64/rows-4,'#87aebb','#6e98a7');for(let i=0;i<3;i++)rect(10,49+i*10,24,6,'#b6c8ba');tree(17,83);tree(33,83);
 }
 if(b.type==='logistics'){
  roof(8,10,84,44+tier*4,'#c8d3d1');for(let i=0;i<5;i++){line(15+i*16,15,15+i*16,49,'#b7c5c2');rect(13+i*17,60+tier*3,9,15,'#dde0d4');rect(14+i*17,61+tier*3,7,3,'#b7c7c7');}for(let i=0;i<level;i++)rect(9+i*10,81,7,6,['#d0bfaa','#bacbc5','#c3ced9'][i%3]);
 }
 if(b.type==='airport'){
  rect(8,7,17,80,'#9bafb3');for(let yy=13;yy<85;yy+=13)rect(16,yy,1,7,'#f4faf5');roof(42,15,49,38+tier*8,'#baccd1');rect(49,22,35,15,'#95b6c1');line(33,68,91,68,'#fbfcfa',2);for(let i=0;i<3;i++){rect(44+i*18,64,10,1.5,'#aebdc0');rect(48+i*18,59,2,12,'#aebdc0');}
 }
 if(tier>0){c.strokeStyle=tier===2?'#90aaa5':'#bbc7bb';c.lineWidth=1;c.strokeRect(3,3,94,81);}c.restore();
}
