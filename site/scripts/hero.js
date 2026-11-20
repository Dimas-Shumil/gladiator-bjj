const hero = document.querySelector('[data-hero]');

if (hero) {
  const pagination = hero.querySelector('.hero__pagination');
  const buttons = [...hero.querySelectorAll('[data-hero-slide]')];

  if (pagination && buttons.length > 1) {
    pagination.hidden = false;

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        hero.dataset.heroActive = button.dataset.heroSlide;
        buttons.forEach((item) => {
          item.setAttribute('aria-pressed', String(item === button));
        });
      });
    });
  }
}
