import {Router} from 'express';
import path from 'node:path';
import {asyncHandler} from '../lib/http.js';
import {renderNewsCatalog, renderHomeNews} from '../services/catalog-render.service.js';
import {eventNotFound, eventPath, readEventPage, renderEventDetail} from '../services/events-render.service.js';
import {newsArticle, newsMeta} from '../services/news-render.service.js';
import {publishedNews, publicNews, mediaDir} from '../services/news.service.js';
import {publishedCompetitions} from '../services/competitions.service.js';
import {renderHomeCompetitions} from '../services/competitions-render.service.js';

export default function createPublicNewsRouter({db, config}) {
  const router = Router();
  const noStore = (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  };
  router.use(['/news', '/news-item', '/api/news', '/media/news'], noStore);

  router.get('/api/news', asyncHandler(async (_req, res) => res.json({news: await publishedNews(db)})));
  router.get('/api/news/search', asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').slice(0, 100).toLocaleLowerCase('ru').replace(/ё/g, 'е').trim().split(/\s+/).filter(Boolean);
    const news = await publishedNews(db);
    const items = news.filter(n => q.every(word =>
      [n.title, n.lead, n.text, n.category].join(' ').toLocaleLowerCase('ru').replace(/ё/g, 'е').includes(word)
    )).slice(0, 100).map(n => ({
      title: n.title, description: n.lead, category: 'Новости · ' + n.category, href: eventPath('news', n), keywords: ''
    }));
    res.json({items});
  }));

  router.get('/media/news/:file', asyncHandler(async (req, res) => {
    const file = req.params.file;
    if (!/^[a-f0-9]{48}\.webp$/.test(file)) return eventNotFound(config, res);
    const src = '/media/news/' + file;
    const news = await publishedNews(db);
    if (!news.some(n => n.cover === src || n.gallery.some(photo => photo.src === src))) return eventNotFound(config, res);
    res.type('webp').sendFile(path.join(mediaDir(config), file), {cacheControl: false}, error => {
      if (error && !res.headersSent) res.status(404).end();
    });
  }));

  const detail = asyncHandler(async (req, res) => {
    const where = req.params.slug ? {slug: req.params.slug} : {id: typeof req.query.id === 'string' ? req.query.id : ''};
    const row = await db.news.findFirst({where: {...where, status: 'published', publishedPayload: {not: null}}});
    if (!row) return eventNotFound(config, res);
    if (!req.params.slug) return res.redirect(301, eventPath('news', row));
    const news = publicNews(row);
    res.type('html').send(await renderEventDetail(config, 'news', news, {
      meta: newsMeta(news), lead: news.lead, body: newsArticle(news)
    }));
  });
  router.get('/news/:slug', detail);
  router.get('/news-item', detail);

  router.get('/news', asyncHandler(async (req, res) => {
    const [html, news] = await Promise.all([readEventPage(config, 'news'), publishedNews(db)]);
    res.type('html').send(renderNewsCatalog(html, news, req.query));
  }));

  router.get('/', noStore, asyncHandler(async (_req, res) => {
    const [html, news, competitions] = await Promise.all([
      readEventPage(config, 'index'), publishedNews(db), publishedCompetitions(db)
    ]);
    res.type('html').send(renderHomeCompetitions(renderHomeNews(html, news), competitions));
  }));
  return router;
}
