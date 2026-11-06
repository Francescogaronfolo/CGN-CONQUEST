"""One manual OSM extract, stored locally; the game never calls Overpass."""
from pathlib import Path
import json, urllib.request, urllib.parse

root = Path(__file__).resolve().parents[1]
a, b, c, d = json.loads((root / 'data/bounds.json').read_text())
box = f'{b},{a},{d},{c}'
query = f'''[out:json][timeout:75];(
way["highway"]({box});way["building"]({box});way["waterway"]({box});
way["natural"~"water|wood"]({box});
way["landuse"~"forest|farmland|grass|meadow|residential|industrial|commercial"]({box});
node["place"~"town|village|hamlet|suburb"]({box}););out geom;'''
endpoint = 'https://overpass.private.coffee/api/interpreter'
req = urllib.request.Request(endpoint, data=urllib.parse.urlencode({'data': query}).encode(), headers={'User-Agent': 'CGN-Conquest-prototype/0.1 (one municipal extract)'})
with urllib.request.urlopen(req, timeout=95) as response:
    raw = json.load(response)
if raw.get('remark'):
    raise RuntimeError('Incomplete extract: ' + raw['remark'])
features, places = [], []
for el in raw.get('elements', []):
    tags = el.get('tags', {})
    if el['type'] == 'node':
        places.append({'name': tags.get('name', ''), 'point': [el['lon'], el['lat']], 'id': str(el['id'])})
        continue
    points = [[p['lon'], p['lat']] for p in el.get('geometry', []) if 'lon' in p and 'lat' in p]
    if len(points) < 2:
        continue
    kind = 'building' if 'building' in tags else 'road' if 'highway' in tags else 'water' if tags.get('waterway') or tags.get('natural') == 'water' else 'land'
    polygon = points[0] == points[-1] and len(points) >= 4 and kind != 'road'
    keep = {k: v for k, v in tags.items() if k in ['building', 'highway', 'waterway', 'natural', 'landuse', 'name', 'width', 'lanes', 'building:levels', 'addr:street', 'addr:housenumber']}
    features.append({'type': 'Feature', 'id': 'osm-way-' + str(el['id']), 'properties': {'kind': kind, **keep}, 'geometry': {'type': 'Polygon' if polygon else 'LineString', 'coordinates': [points] if polygon else points}})
(root / 'data/territory.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, separators=(',', ':'), ensure_ascii=False), encoding='utf-8')
report = {'source': 'OpenStreetMap / Overpass API', 'endpoint': endpoint, 'timestamp': raw.get('osm3s', {}).get('timestamp_osm_base'), 'bbox': [a, b, c, d], 'counts': {kind: sum(f['properties']['kind'] == kind for f in features) for kind in ['building', 'road', 'water', 'land']}, 'places': places, 'query': query}
(root / 'data/provenance.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'counts': report['counts'], 'places': places}, ensure_ascii=False))
