"""Build the authenticated Host-backed Knowledge panel from the standalone page."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent
page = (root.parent / 'knowledge' / 'index.html').read_text(encoding='utf-8')
bridge = (root / 'page-bridge.js').read_text(encoding='utf-8')
floating = (root / 'floating-widget.js').read_text(encoding='utf-8')
template = (root / 'client-template.js').read_text(encoding='utf-8')

anchor = '  /* ---------------- boot ---------------- */'
if page.count(anchor) != 1:
    raise RuntimeError('Expected exactly one boot anchor in knowledge/index.html')
page = page.replace(anchor, bridge + '\n' + anchor, 1)

# Prevent inline-script termination if future bridge code contains a literal closing tag.
if '</script' in bridge.lower():
    raise RuntimeError('Bridge must not contain inline script closing tags')

assert template.count('__PAGE__') == 1
assert template.count('__FLOATING_WIDGET__') == 1
bundle = template.replace('__PAGE__', json.dumps(page, ensure_ascii=False))
bundle = bundle.replace('__FLOATING_WIDGET__', floating)
(root / 'lib' / 'client.js').write_text(bundle, encoding='utf-8')
print('Built', root / 'lib' / 'client.js')
