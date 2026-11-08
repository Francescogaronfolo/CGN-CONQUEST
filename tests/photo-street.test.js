import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {PHOTO_SCENES,photoLayout,clampPhotoOffset,photoSites} from '../src/photo-street-model.js';
const catalog=JSON.parse(readFileSync(new URL('../data/catalog.json',import.meta.url)));
test('Every photographic facade is backed by one playable unprotected property and a licensed local image',()=>{
 for(const s of PHOTO_SCENES){
  assert(existsSync(new URL('../'+s.file,import.meta.url)));
  assert(s.license.startsWith('CC BY-SA'));assert(s.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
  assert.equal(photoSites(s,catalog).length,s.sites.length);
  assert(PHOTO_SCENES.some(next=>next.id===s.next));
  for(const site of s.sites){assert(site.polygon.length>=3);assert(site.polygon.flat().every(n=>Number.isFinite(n)&&n>=0&&n<=1));assert(site.anchor.every(n=>n>=0&&n<=1));}
 }
});
test('Photo drag and zoom cannot expose blank canvas at desktop or narrow mobile sizes',()=>{
 for(const scene of PHOTO_SCENES)for(const viewport of [{width:390,height:844},{width:1280,height:720}])for(const zoom of [1,1.3,3]){
  const layout=photoLayout(viewport.width,viewport.height,scene,zoom);
  for(const x of [-10000,10000,0])for(const y of [-10000,10000,0]){
   const p=clampPhotoOffset(x,y,layout,viewport);
   assert(p.x<=1e-8&&p.y<=1e-8);assert(p.x+layout.width>=viewport.width-1e-8);assert(p.y+layout.height>=viewport.height-1e-8);
  }
 }
});
