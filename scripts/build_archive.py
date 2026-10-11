"""Publish the registered HD pack catalogue, reusing patch-hub covers."""
import json
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]

def build(data, patches):
    known = {p['repo']: p for p in patches}
    ids = set()
    for pack in data['packs']:
        if pack['id'] in ids:
            raise ValueError('Duplicate pack id')
        ids.add(pack['id'])
        patch = known.get(pack['patch_repo'], {})
        for key in ('cover', 'cover_source'):
            if patch.get(key):
                value = patch[key]
                if key == 'cover' and not value.startswith('https://'):
                    value = 'https://dollars-archive.github.io/Dollars-Archive/' + value
                    if patch.get('cover_revision'):
                        value += '?v=' + patch['cover_revision']
                pack[key] = value
    return data

if __name__ == '__main__':
    data = json.loads((ROOT / 'packs.json').read_text(encoding='utf-8'))
    with urlopen('https://dollars-archive.github.io/Dollars-Archive/data/patches.json', timeout=30) as response:
        patches = json.load(response)['patches']
    target = ROOT / 'docs/data/packs.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(build(data, patches), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
