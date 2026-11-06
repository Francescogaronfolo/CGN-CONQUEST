"""Enrich the geographic snapshot; preserve existing property IDs and saved games."""
import json, math
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def read(name):return json.loads((root/'data'/name).read_text(encoding='utf-8'))
def write(name,data):(root/'data'/name).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
ring=read('cuggiono-boundary.geojson')['geometry']['coordinates'][0]
def inside(p,r=ring):
 x,y=p; result=False
 for i,a in enumerate(r):
  b=r[i-1]
  if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:result=not result
 return result
def center(points):return [sum(p[j] for p in points)/len(points) for j in [0,1]]
def category(t):
 if t.get('historic') or t.get('tourism') in ['museum','attraction','artwork']:return 'heritage'
 if t.get('amenity') in ['school','kindergarten','hospital','clinic','police','townhall','library','community_centre','post_office','fire_station','place_of_worship'] or t.get('building') in ['church','chapel','school','hospital','civic']:return 'civic'
 if t.get('building') in ['industrial','warehouse'] or t.get('craft'):return 'industry'
 if t.get('shop') or t.get('office') or t.get('amenity') in ['restaurant','cafe','bar','pub','bank','pharmacy','fuel'] or t.get('building') in ['retail','commercial'] or t.get('tourism')=='hotel':return 'commerce'
 if t.get('building') in ['house','detached','apartments','residential','terrace']:return 'residential'
 return 'unknown'
keep=['name','building','height','building:levels','roof:shape','roof:colour','building:colour','historic','tourism','amenity','shop','office','craft','highway','bridge','tunnel','surface','lanes','waterway','width','landuse','leisure','natural','addr:street','addr:housenumber']
def stitch(parts):
 parts=[p[:] for p in parts if len(p)>1];rings=[]
 while parts:
  chain=parts.pop()
  while chain[0]!=chain[-1]:
   for i,p in enumerate(parts):
    if chain[-1]==p[0]:chain+=p[1:];parts.pop(i);break
    if chain[-1]==p[-1]:chain+=p[-2::-1];parts.pop(i);break
    if chain[0]==p[-1]:chain=p[:-1]+chain;parts.pop(i);break
    if chain[0]==p[0]:chain=p[:0:-1]+chain;parts.pop(i);break
   else:break
  if len(chain)>3 and chain[0]==chain[-1]:rings.append(chain)
 return rings
raw=[];snapshots=[]
for file in ['osm-buildings.json','osm-network.json','osm-pois.json','osm-landuse.json','osm-leisure.json','osm-natural.json','osm-context.json']:
 if not (root/'data'/file).exists():continue
 d=read(file);raw+=d['elements'];snapshots.append({'file':file,'timestamp':d.get('osm3s',{}).get('timestamp_osm_base')})
elements={f"osm-{e['type']}-{e['id']}":e for e in raw}
geo=read('territory.geojson');catalog=read('catalog.json');pois=[];land=[]
for fid,e in elements.items():
 if e['type']!='relation':continue
 parts=lambda role:[[[p['lon'],p['lat']] for p in m.get('geometry',[]) if 'lon'in p] for m in e.get('members',[]) if m.get('role','outer')==role]
 outer=stitch(parts('outer'));inner=stitch(parts('inner'))
 if not outer:continue
 polygons=[[r]+[h for h in inner if inside(h[0],r)] for r in outer]
 e['_geometry']={'type':'Polygon','coordinates':polygons[0]} if len(polygons)==1 else {'type':'MultiPolygon','coordinates':polygons}
 e['geometry']=[{'lon':p[0],'lat':p[1]} for p in max(outer,key=len)]
 if e.get('tags',{}).get('building') and inside(center(max(outer,key=len))):
  if not any(f['id']==fid for f in geo['features']):geo['features'].append({'type':'Feature','id':fid,'properties':{'kind':'building'},'geometry':e['_geometry']})
for f in geo['features']:
 t=elements.get(f['id'],{}).get('tags',{});f['properties'].update({k:t[k] for k in keep if k in t})
 if f['properties']['kind']=='building':f['properties']['category']=category(t)
 if f['properties']['kind']=='road' and t.get('area')=='yes' and f['geometry']['coordinates'][0]==f['geometry']['coordinates'][-1]:f['geometry']={'type':'Polygon','coordinates':[f['geometry']['coordinates']]}
for fid,e in elements.items():
 t=e.get('tags',{});pts=[[p['lon'],p['lat']] for p in e.get('geometry',[]) if 'lon'in p]
 point=[e['lon'],e['lat']] if e['type']=='node' else center(pts[:-1] or pts) if pts else None
 if point and e['type'] in ['way','relation'] and (t.get('landuse') or t.get('leisure') or t.get('natural')) and len(pts)>3 and pts[0]==pts[-1]:
  land.append({'type':'Feature','id':fid,'properties':{k:t[k] for k in keep if k in t},'geometry':e.get('_geometry',{'type':'Polygon','coordinates':[pts]})})
 if not point or not inside(point) or not t.get('name'):continue
 cat=category(t)
 if cat=='unknown' and t.get('leisure') in ['park','garden','sports_centre']:cat='green'
 if cat not in ['heritage','civic','industry','commerce','green']:continue
 pois.append({'id':fid,'name':t['name'],'point':point,'category':cat,'tags':{k:t[k] for k in keep if k in t},'source':'https://www.openstreetmap.org/'+e['type']+'/'+str(e['id'])})
building_features={f['id']:f for f in geo['features'] if f['properties']['kind']=='building'}
for p in catalog:
 f=building_features[p['id']];t=f['properties'];p['realCategory']=t['category'];p['protected']=t['category'] in ['heritage','civic'];p['realName']=t.get('name','') if t['category'] in ['heritage','civic','industry','commerce'] else ''
 address=t.get('addr:street','')+(' '+t['addr:housenumber'] if t.get('addr:housenumber') else '')
 if address:p['label']=address
 # Publicly mapped services can be nodes inside an otherwise unclassified building.
 for poi in pois:
  if poi['id']==p['id'] or not inside(poi['point'],f['geometry']['coordinates'][0]):continue
  if poi['category'] in ['civic','heritage']:p['protected']=True
  if p['realCategory']=='unknown':p['realCategory']=poi['category'];f['properties']['category']=poi['category']
  if not p['realName']:p['realName']=poi['name']
for poi in pois:
 for f in building_features.values():
  if f['geometry']['type']=='Polygon' and inside(poi['point'],f['geometry']['coordinates'][0]):
   poi['buildingId']=f['id'];break
curated={
 'Villa Annoni':{'description':'Villa neoclassica, oggi sede del Comune. Il parco e il museo ne fanno un riferimento del centro di Cuggiono.','reference':'https://comune.cuggiono.mi.it/luoghi/2707123/villa-annoni'},
 'Palazzo Clerici':{'description':'Complesso storico affacciato sul Naviglio Grande, riconoscibile per la scalinata verso il canale.','reference':'https://comune.cuggiono.mi.it/luoghi/2270030/frazione-castelletto'},
 'Chiesa dei Santi Giacomo e Filippo':{'description':'Chiesa storica del borgo di Castelletto, documentata nelle fonti comunali.','reference':'https://comune.cuggiono.mi.it/luoghi/2270030/frazione-castelletto'},
 'Parco di Villa Annoni':{'description':'Parco storico della villa, con giardini, percorsi e architetture neoclassiche.','reference':'https://comune.cuggiono.mi.it/luoghi/2269302/parco-villa-annoni'}
}
curated['Museo storico civico cuggionese']={'description':'Museo ospitato in Villa Annoni, dedicato alla vita e al lavoro locali e alla storia di Cuggiono.','reference':'https://cultura.gov.it/luogo/museo-storico-civico-cuggionese'}
curated['Chiesa di San Giorgio']={'description':'Chiesa storica affacciata su Piazza San Giorgio, censita nel patrimonio architettonico regionale.','reference':'https://www.lombardiabeniculturali.it/architetture/schede/4m010-00278/'}
for p in pois:
 if p['name'] in curated:p.update(curated[p['name']]);p['priority']=100
 # No private contact details, rating, claimed endorsement or real business income.
 p.setdefault('priority',70 if p['category']=='heritage' else 45 if p['category']=='civic' else 30)
write('territory.geojson',geo);write('catalog.json',catalog)
write('places.json',{'places':pois,'snapshots':snapshots})
write('landscape.geojson',{'type':'FeatureCollection','features':land})
report=read('provenance.json');report['counts']={k:sum(f['properties']['kind']==k for f in geo['features']) for k in ['building','road','water']};report['context']={'places':len(pois),'landscapeAreas':len(land),'snapshots':snapshots,'coverage':'OSM municipal bbox for buildings, roads and POI nodes; OSM API centre and western sector for detailed land use. Not a complete cadastral or live business register.'};write('provenance.json',report)
print(json.dumps({'places':len(pois),'zones':len(land),'categories':{k:sum(p['category']==k for p in pois) for k in ['heritage','civic','industry','commerce','green']}},ensure_ascii=False))
