import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const components = await Promise.all(['header', 'footer'].map(async (name) => ({
  name,
  html: (await readFile(path.join(root, 'components', `${name}.html`), 'utf8')).trim(),
})));
for (const filename of await readdir(path.join(root, 'public'))) {
  if (!filename.endsWith('.html')) continue;
  const target = path.join(root, 'public', filename);
  let html = await readFile(target, 'utf8');
  for (const { name, html: component } of components) {
    const block = `<!-- site-component:${name}:start -->\n${component}\n<!-- site-component:${name}:end -->`;
    const generated = new RegExp(`<!-- site-component:${name}:start -->[\\s\\S]*?<!-- site-component:${name}:end -->`);
    const mount = new RegExp(`<div\\b[^>]*id=["']site-${name}["'][^>]*data-include=["'][^"']+["'][^>]*>\\s*</div>`);
    html = generated.test(html) ? html.replace(generated, () => block) : html.replace(mount, () => block);
  }
  await writeFile(target, html);
}
console.log('Публичные страницы: хедер и футер обновлены из components.');
