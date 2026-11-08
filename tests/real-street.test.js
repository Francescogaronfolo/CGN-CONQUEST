import test from 'node:test';
import assert from 'node:assert/strict';
import {REAL_STREET_STOPS,nearbyProperties,mapsStreetURL} from '../src/real-street-model.js';
test('Real street selects only nearby playable properties in stable distance order',()=>{
 const point=REAL_STREET_STOPS[0].point;
 const items=[{id:'far',center:[9,46]},{id:'b',center:point},{id:'a',center:point},{id:'protected',center:point,protected:true}];
 assert.deepEqual(nearbyProperties(items,point).map(x=>x.p.id),['a','b']);
 assert.equal(nearbyProperties(items,point,1).length,1);
});
test('Real street links use latitude before longitude and retain surveyed stops',()=>{
 const u=new URL(mapsStreetURL([8.8,45.5]));assert.equal(u.searchParams.get('viewpoint'),'45.5,8.8');assert.equal(u.searchParams.get('map_action'),'pano');
 assert.equal(REAL_STREET_STOPS.length,3);
 assert(REAL_STREET_STOPS.every(s=>s.point[0]>8.7&&s.point[0]<8.9&&s.point[1]>45.4&&s.point[1]<45.6));
});
