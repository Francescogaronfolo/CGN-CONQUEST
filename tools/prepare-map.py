"""Compile cached OSM extracts; no invented building geometry."""
import json, math
from pathlib import Path
root=Path(__file__).resolve().parents[1]
boundary=json.loads((root/'data/cuggiono-boundary.geojson').read_text())
ring=boundary['geometry']['coordinates'][0]
def inside(p):
 x,y=p; result=False
 for i,a in enumerate(ring):
  b=ring[i-1]
  if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:result=not result
 return result
features=[]; catalog=[]; stamps=[]
for file in ['osm-buildings.json','osm-network.json']:
 raw=json.loads((root/'data'/file).read_text(encoding='utf-8'))
 if raw.get('remark'):raise RuntimeError(raw['remark'])
 stamps.append(raw.get('osm3s',{}).get('timestamp_osm_base'))
 for e in raw['elements']:
  pts=[[p['lon'],p['lat']] for p in e.get('geometry',[]) if 'lon'in p]
  if len(pts)<2:continue
  t=e.get('tags',{}); closed=pts[0]==pts[-1] and len(pts)>3
  kind='building' if 'building'in t else 'water' if 'waterway'in t else 'road'
  center=[sum(p[j] for p in pts[:-1])/len(pts[:-1]) for j in [0,1]] if closed else pts[len(pts)//2]
  if kind=='building' and not inside(center):continue
  fid='osm-way-'+str(e['id'])
  features.append({'type':'Feature','id':fid,'properties':{'kind':kind,'building':t.get('building'),'highway':t.get('highway'),'waterway':t.get('waterway'),'name':t.get('name','')},'geometry':{'type':'Polygon' if closed and kind=='building' else 'LineString','coordinates':[pts] if closed and kind=='building' else pts}})
  if kind!='building' or not closed:continue
  area=abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(pts,pts[1:])))*.5*111320**2*math.cos(math.radians(center[1]))
  typ=t.get('building','yes')
  if typ not in ['yes','house','detached','residential','apartments','terrace','industrial','commercial','retail','warehouse'] or not 45<area<6000 or t.get('amenity') or t.get('historic'):continue
  business='logistics' if typ=='warehouse' else 'workshop' if typ=='industrial' else 'shop' if typ in ['commercial','retail'] else 'services'
  catalog.append({'id':fid,'center':center,'area':round(area),'price':int(1200+min(area,2000)*8),'business':business,'homeCandidate':business=='services','label':t.get('addr:street','Proprietà')+((' '+t['addr:housenumber']) if 'addr:housenumber'in t else '')})
catalog.sort(key=lambda p:(p['center'][0],p['center'][1]))
(root/'data/territory.geojson').write_text(json.dumps({'type':'FeatureCollection','features':features},separators=(',',':')),encoding='utf-8')
(root/'data/catalog.json').write_text(json.dumps(catalog,separators=(',',':')),encoding='utf-8')
(root/'data/provenance.json').write_text(json.dumps({'source':'OpenStreetMap contributors','license':'ODbL 1.0','timestamps':stamps,'boundary':'ISTAT via guglielmo/geojson-italy, CC BY 4.0','counts':{k:sum(f['properties']['kind']==k for f in features) for k in ['building','road','water']},'playable':len(catalog),'economy':'All prices, ownership, activities and income are fictional game values.'},indent=2),encoding='utf-8')
print(len(features),'features;',len(catalog),'playable properties')
