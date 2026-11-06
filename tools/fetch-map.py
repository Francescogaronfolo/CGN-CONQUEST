"""One manual cached municipal extract. Game runtime never calls Overpass."""
from pathlib import Path
import json, urllib.request, urllib.parse, datetime
root = Path(__file__).resolve().parents[1]
a,b,c,d=json.loads((root/'data/bounds.json').read_text())
box=f'{b},{a},{d},{c}'
endpoint='https://overpass-api.de/api/interpreter'
def query(selector):
 q=f'[out:json][timeout:25];way[{selector}]({box});out geom;'
 req=urllib.request.Request(endpoint,data=urllib.parse.urlencode({'data':q}).encode(),headers={'User-Agent':'CGNConquestPrototype/0.1'})
 with urllib.request.urlopen(req,timeout=40) as response: raw=json.load(response)
 if raw.get('remark'):raise RuntimeError('Incomplete extract: '+raw['remark'])
 return raw
buildings=root/'data/osm-buildings.json'
if not buildings.exists():buildings.write_text(json.dumps(query('building')),encoding='utf-8')
network=root/'data/osm-network.json'
if not network.exists():
 roads=query('highway');water=query('waterway');roads['elements']+=water['elements']
 network.write_text(json.dumps(roads),encoding='utf-8')
print('Cached source extracts ready. Run tools/prepare-map.py to compile.')
