import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const [template, page, floating] = await Promise.all([
  readFile(path.join(root, 'client-template.js'), 'utf8'),
  readFile(path.join(root, 'page.html'), 'utf8'),
  readFile(path.join(root, 'floating-widget.js'), 'utf8')
]);
if (template.split('__PAGE__').length !== 2) throw new Error('Expected exactly one __PAGE__ placeholder');
const source = template.replace('__PAGE__', () => JSON.stringify(page).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')).replace('__FLOATING_WIDGET__', floating);
// Parse the generated bundle before publishing it.
new Function(source);
await mkdir(path.join(root, 'lib'), { recursive: true });
await writeFile(path.join(root, 'lib/client.js'), source, 'utf8');
console.log('Built Me client: lib/client.js');
