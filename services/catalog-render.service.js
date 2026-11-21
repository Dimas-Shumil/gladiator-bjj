import {competitionDates, e, eventDate, eventPath, replaceEventSlot} from './events-render.service.js';
import {newsMeta} from './news-render.service.js';

const competitionGroups = [
  ['upcoming', 'Предстоящие'],
  ['completed', 'Завершённые']
];

function eventCard(section, entry, meta, summary, heading = 'h3') {
  const image = section === 'news' ? entry.cover : entry.image;
  return `<a class="events-card" href="${e(eventPath(section, entry))}">
    ${image ? `<img class="events-card__image" src="${e(image)}" alt="" loading="lazy">` : ''}
    <div class="events-card__body">
      ${meta}
      <${heading}>${e(entry.title)}</${heading}>
      ${summary}
      <span class="events-card__action">${section === 'news' ? 'Читать новость' : 'О соревновании'}</span>
    </div>
  </a>`;
}

function catalogFilter(name, label, options, selected) {
  return `<label>${label}<select name="${name}">
    ${options.map(([value, title]) =>
      `<option value="${e(value)}"${value === selected ? ' selected' : ''}>${e(title)}</option>`
    ).join('')}
  </select></label>`;
}

function catalogContent(html, section, rows, query, {field, label, options, dateKey, render}) {
  const year = typeof query.year === 'string' && /^\d{4}$/.test(query.year) ? query.year : '';
  const years = [...new Set([year, ...rows.map(row => row[dateKey].slice(0, 4))])]
    .filter(Boolean).sort().reverse().map(y => [y, y]);
  const value = options.some(([key]) => key && key === query[field]) ? query[field] : '';
  const selected = rows.filter(row => (!year || row[dateKey].startsWith(year)) && (!value || row[field] === value));
  const heading = section === 'news' ? 'Публикации' : 'Календарь соревнований';
  const filters = rows.length ? `<form class="events-filters" action="/${section}" method="get">
    ${catalogFilter(field === 'eventStatus' ? 'status' : field, label, options, value)}
    ${catalogFilter('year', 'Год', [['', 'Все годы'], ...years], year)}
    <button class="events-button" type="submit">Показать</button>
    ${year || value ? `<a class="events-reset" href="/${section}">Сбросить</a>` : ''}
  </form>` : '';
  const body = `<section class="events-list container" aria-labelledby="events-list-title">
    <h2 id="events-list-title">${heading}</h2>
    ${filters}
    ${selected.length ? render(selected) : `<p class="events-empty">${rows.length
      ? 'По этим фильтрам ничего не найдено.'
      : section === 'news' ? 'Новостей пока нет.' : 'Соревнования пока не опубликованы.'}</p>`}
  </section>`;
  return replaceEventSlot(html, 'events-list', body);
}

export function renderNewsCatalog(html, rows, query = {}) {
  const categories = [...new Set(rows.map(news => news.category))];
  if (typeof query.category === 'string' && ['Клуб', 'История', 'Соревнования'].includes(query.category) &&
      !categories.includes(query.category)) categories.push(query.category);
  return catalogContent(html, 'news', rows, query, {
    field: 'category',
    label: 'Категория',
    options: [['', 'Все категории'], ...categories.map(category => [category, category])],
    dateKey: 'publishedAt',
    render: news => `<div class="events-grid">${news.map(entry => eventCard(
      'news', entry, newsMeta(entry), `<p class="events-card__summary">${e(entry.lead)}</p>`
    )).join('')}</div>`
  });
}

export function renderCompetitionCatalog(html, rows, query = {}) {
  return catalogContent(html, 'competitions', rows, {...query, eventStatus: query.status}, {
    field: 'eventStatus',
    label: 'Состояние',
    options: [['', 'Все соревнования'], ...competitionGroups],
    dateKey: 'startDate',
    render: entries => competitionGroups.map(([status, title]) => {
      const group = entries.filter(entry => entry.eventStatus === status);
      if (!group.length) return '';
      if (status === 'completed') group.reverse();
      return `<section class="events-group"><h3>${title}</h3>
        <div class="events-grid">${group.map(entry => eventCard('competitions', entry,
          `<div class="events-meta">${competitionDates(entry)}</div>`,
          `<p class="events-card__location">${e(entry.location)}</p>
           ${entry.lead ? `<p class="events-card__summary">${e(entry.lead)}</p>` : ''}`, 'h4'
        )).join('')}</div></section>`;
    }).join('')
  });
}

export function renderHomeNews(html, rows) {
  if (!rows.length) return html;
  const cards = rows.slice(0, 2).map(news => `<a class="news-tile" href="${e(eventPath('news', news))}">
    ${news.cover ? `<div class="news-tile__image"><img src="${e(news.cover)}" alt="" loading="lazy"></div>` : ''}
    <span class="news-tile__category">${e(news.category)} · <time datetime="${e(news.publishedAt)}">${e(eventDate(news.publishedAt))}</time></span>
    <h3>${e(news.title)}</h3><p>${e(news.lead)}</p>
  </a>`).join('');
  return replaceEventSlot(html, 'home-news', `<div class="home-news__grid">${cards}</div>`);
}
