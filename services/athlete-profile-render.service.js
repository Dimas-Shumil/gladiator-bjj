import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {e} from './events-render.service.js';

const paragraphs = value => value ? value.split(/\n\s*\n/).map(text => `<p>${e(text)}</p>`).join('') : '';

export async function renderAthleteProfile(config, person, {preview = false, coach = false} = {}) {
  const shell = await readFile(path.join(config.ROOT, 'public/team.html'), 'utf8');
  const source = src => preview ? src.replace(/^\/media\/people\//, '/api/admin/people/media/') : src;
  const photo = (src, alt, eager = false) => `<img src="${e(source(src))}" alt="${e(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
  const role = coach ? 'Тренер' : 'Спортсмен';
  const title = coach ? person.coachTitle : person.athleteTitle;
  const portrait = coach ? person.coachPortrait || person.portrait : person.portrait;
  const facts = (coach ? [
    ['Направление', person.specialization], ['Тренерский стаж', person.experience],
    ['Пояс', person.belt], ['Клуб', person.club || 'Gladiator BJJ'], ['Город', person.city]
  ] : [
    ['Пояс', person.belt], ['Дисциплина', person.discipline], ['Клуб', person.club || 'Gladiator BJJ'],
    ['Тренер', person.trainer], ['Статус', person.athleteStatus], ['Город', person.city]
  ]).filter(([, value]) => value);
  const awards = (coach ? person.coachAwards : person.athleteAwards) ?? [];
  const timeline = (person.timeline ?? []).filter(item => ['all', coach ? 'coach' : 'athlete'].includes(item.role));
  const gallery = person.gallery ?? [];
  const biography = (coach ? person.coachBio : person.athleteBio) || person.bio;
  const quote = (coach ? person.coachQuote : person.athleteQuote) || person.quote;
  const content = `<main class="club-athlete">
    ${preview ? `<aside class="club-athlete__preview">Закрытый предпросмотр · <a href="/admin/person-edit?id=${e(encodeURIComponent(person.id))}">Вернуться в редактор</a></aside>` : ''}
    <header class="club-athlete__hero">
      ${portrait ? `<figure class="club-athlete__portrait">${photo(portrait, person.portraitAlt || person.name, true)}${person.photoCredit ? `<figcaption>${e(person.photoCredit)}</figcaption>` : ''}</figure>` : ''}
      <div class="container club-athlete__hero-inner">
        <a class="club-athlete__back" href="/team#${coach ? 'trainers' : 'athletes'}">‹ Спортсостав</a>
        <p class="club-athlete__role">${role}</p>
        <h1>${e(person.name)}</h1>
        ${title ? `<p class="club-athlete__title">${e(title)}</p>` : ''}
        <dl class="club-athlete__facts">${facts.map(([label, value]) => `<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>
      </div>
    </header>
    ${awards.length ? `<section class="club-athlete__awards"><div class="container club-athlete__awards-inner">
      <h2>Достижения</h2>
      <ul>${awards.map(item => `<li><span class="club-athlete__place">${e(/^\d+$/.test(item.place) ? item.place + ' место' : item.place)}</span><span>${e(item.date)}</span><div><strong>${e(item.title)}</strong>${paragraphs(item.text)}</div></li>`).join('')}</ul>
    </div></section>` : ''}
    ${timeline.length || person.storyImage || biography || quote ? `<div class="container club-athlete__story">
      ${timeline.length ? `<section><h2>Спортивный путь</h2><ol class="club-athlete__timeline">${timeline.map(item => `<li><strong>${e(item.date)}</strong><div><h3>${e(item.title)}</h3>${paragraphs(item.text)}</div></li>`).join('')}</ol></section>` : ''}
      ${person.storyImage || biography || quote ? `<section><h2>${coach ? 'О тренере' : 'О спортсмене'}</h2>
        ${person.storyImage ? `<figure>${photo(person.storyImage, person.storyCaption || person.name)}${person.storyCaption ? `<figcaption>${e(person.storyCaption)}</figcaption>` : ''}</figure>` : ''}
        ${paragraphs(biography)}${quote ? `<blockquote>${e(quote)}</blockquote>` : ''}
      </section>` : ''}
    </div>` : ''}
    ${coach && (person.school || person.methodQuote || person.methods?.length) ? `<div class="container club-athlete__story">
      <section><h2>Подход к тренировкам</h2>${paragraphs(person.school)}
        ${person.methodQuote ? `<blockquote>${e(person.methodQuote)}</blockquote>` : ''}
        ${(person.methods ?? []).map(item => `<h3>${e(item.title)}</h3>${paragraphs(item.text)}`).join('')}
      </section>
    </div>` : ''}
    ${gallery.length ? `<section class="container club-athlete__gallery"><h2>Фотогалерея</h2><ul>${gallery.map((item, index) => `<li><a href="${e(source(item.src))}" data-athlete-photo aria-label="Открыть фото ${index + 1}">${photo(item.src, item.alt || item.caption || '')}</a>${item.caption || item.credit ? `<p>${e([item.caption, item.credit].filter(Boolean).join(' · '))}</p>` : ''}</li>`).join('')}</ul></section>` : ''}
    ${gallery.length ? `<dialog class="club-athlete-lightbox" aria-label="Просмотр фотографий">
      <div class="club-athlete-lightbox__controls">
        <span data-photo-count aria-live="polite"></span>
        <button type="button" data-photo-close aria-label="Закрыть" autofocus>×</button>
      </div>
      <div class="club-athlete-lightbox__stage" data-photo-stage>
        <button type="button" data-photo-step="-1" aria-label="Предыдущее фото">‹</button>
        <img data-photo-image alt="" draggable="false">
        <button type="button" data-photo-step="1" aria-label="Следующее фото">›</button>
      </div>
      <p data-photo-caption></p>
    </dialog>` : ''}
  </main>`;
  return shell.replace(/<title>[^<]*<\/title>/, () => `<title>${e(person.name)} | GLADIATOR BJJ</title>`)
    .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${e(person.summary || person.name + ' — ' + role.toLowerCase() + ' клуба Gladiator BJJ')}">`)
    .replace('</head>', () => `<link rel="stylesheet" href="/site/css/club-athlete.min.css?v=gallery2">
    ${gallery.length ? '<script src="/site/scripts/athlete-gallery.js" defer></script>' : ''}
    </head>`)
    .replace(/<main class="club-team">[\s\S]*?<\/main>/, () => content);
}
