import {readFile} from 'node:fs/promises';
import path from 'node:path';
export const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const publicDir = config => path.join(config.ROOT, 'public');
const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
});

export const readEventPage = (config, name) => readFile(path.join(publicDir(config), name + '.html'), 'utf8');

export const eventNotFound = (config, res) => res.status(404).sendFile(path.join(publicDir(config), '404.html'));

export function eventPath(section, entry) {
  return '/' + section + '/' + encodeURIComponent(entry.slug);
}

export function eventDate(value) {
  if (!value) return '';
  return dateFormat.format(new Date(value + 'T12:00:00Z')).replace(/ г\.$/, '');
}

export function competitionDates({startDate, endDate}) {
  if (!startDate) return 'Дата уточняется';
  const start = '<time datetime="' + e(startDate) + '">' + e(eventDate(startDate)) + '</time>';
  if (!endDate || startDate === endDate) return start;
  return start + ' — <time datetime="' + e(endDate) + '">' + e(eventDate(endDate)) + '</time>';
}

export function replaceEventSlot(html, name, body) {
  const slot = new RegExp('<!-- ' + name + ':start -->[\\s\\S]*?<!-- ' + name + ':end -->');
  return html.replace(slot, () => body);
}

function eventHero({title, lead, navigation, meta}) {
  return `<header class="events-hero events-hero--detail">
    <div class="container events-hero__inner">
      ${navigation}
      <h1>${e(title)}</h1>
      ${meta}
      ${lead ? `<p>${e(lead)}</p>` : ''}
    </div>
  </header>`;
}

export function eventImage(src, alt, caption, credit, thumbnail = false) {
  const note = [caption, credit].filter(Boolean).join(' · ');
  const image = `<img src="${e(src)}" alt="${e(alt)}" ${thumbnail ? 'loading="lazy"' : 'fetchpriority="high"'}>`;
  return `<figure class="events-image">${thumbnail ? `<a href="${e(src)}" aria-label="${e(alt || caption || 'Открыть фотографию')}">${image}</a>` : image}${note ? `<figcaption>${e(note)}</figcaption>` : ''}</figure>`;
}

export function eventGallery(title, figures) {
  return `<section class="events-detail__section" aria-label="${e(title)}">
    <h2>${e(title)}</h2>
    <div class="events-gallery">${figures.join('')}</div>
  </section>`;
}

export async function renderEventDetail(config, section, entry, {meta = '', lead = '', body, preview = ''}) {
  const news = section === 'news';
  const catalog = news ? 'К новостям' : 'К соревнованиям';
  const html = await readEventPage(config, section);
  const navigation = `<nav class="events-crumbs" aria-label="Хлебные крошки"><a href="/">Главная</a><a href="/${section}">${news ? 'Новости' : 'Соревнования'}</a></nav>`;
  const content = `${preview}<article>
    ${eventHero({title: entry.title, lead, navigation, meta})}
    <div class="container events-detail">
      ${body}
      <a class="events-button events-detail__back" href="/${section}">${catalog}</a>
    </div>
  </article>`;
  return replaceEventSlot(html, 'events-content', content)
    .replace(/<title>[^<]*<\/title>/, () => `<title>${e(entry.title)} | GLADIATOR BJJ</title>`)
    .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${e(entry.lead || entry.description)}">`)
    .replace(/<main class="events-page"/, '<main class="events-page" data-section="/' + section + '"');
}
