import {e, eventDate, eventGallery, eventImage} from './events-render.service.js';

export {e};

export function newsArticle(news) {
  const {title, cover, alt, coverCaption, coverCredit, text, author, source, gallery} = news;
  const paragraphs = text.split(/\n\s*\n/).map(part => `<p>${e(part)}</p>`).join('');
  const sourceLabel = source?.url
    ? `<a href="${e(source.url)}" rel="noopener noreferrer">${e(source.title || source.url)}</a>`
    : e(source?.title);
  return `${cover ? eventImage(cover, alt || title, coverCaption, coverCredit) : ''}
    <div class="events-prose">${paragraphs}</div>
    ${author || sourceLabel ? `<div class="events-credits">
      ${author ? `<p>Автор: ${e(author)}</p>` : ''}
      ${sourceLabel ? `<p>Источник: ${sourceLabel}</p>` : ''}
    </div>` : ''}
    ${gallery.length ? eventGallery('Фотографии', gallery.map(photo =>
      eventImage(photo.src, photo.alt || photo.caption, photo.caption, photo.source, true)
    )) : ''}`;
}

export function newsMeta(news) {
  return `<div class="events-meta">
    <span class="events-label">${e(news.category)}</span>
    <time datetime="${e(news.publishedAt)}">${e(eventDate(news.publishedAt))}</time>
  </div>`;
}
