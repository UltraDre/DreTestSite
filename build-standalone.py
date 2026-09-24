"""Inline CSS + JS into a single file (handy for sharing / previewing without a server).
The full PWA (offline + install) still requires serving the folder over http(s)."""
import pathlib, re
root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text()
css = (root / 'css/styles.css').read_text()
html = html.replace('<link rel="stylesheet" href="css/styles.css" />', f'<style>\n{css}\n</style>')
for js in ['js/data.js', 'js/app.js']:
    code = (root / js).read_text()
    html = html.replace(f'<script src="{js}"></script>', f'<script>\n{code}\n</script>')
svg = (root / 'icons/icon.svg').read_text()
import base64
data_uri = 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode()).decode()
html = html.replace('href="icons/icon.svg"', f'href="{data_uri}"')
html = re.sub(r'\s*<link rel="manifest"[^>]*>', '', html)
(root / 'daygrid-standalone.html').write_text(html)
print('wrote daygrid-standalone.html', len(html)//1024, 'KB')
