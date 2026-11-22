(() => {
  const dialog = document.querySelector('.club-athlete-lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const thumbnails = [...document.querySelectorAll('[data-athlete-photo]')];
  const image = dialog.querySelector('[data-photo-image]');
  const stage = dialog.querySelector('[data-photo-stage]');
  const caption = dialog.querySelector('[data-photo-caption]');
  const count = dialog.querySelector('[data-photo-count]');
  const close = dialog.querySelector('[data-photo-close]');
  const steps = [...dialog.querySelectorAll('[data-photo-step]')];
  let current = 0;
  let opener;
  let touch;

  function show(index) {
    current = (index + thumbnails.length) % thumbnails.length;
    const link = thumbnails[current];
    image.alt = link.querySelector('img').alt;
    image.src = link.href;
    caption.textContent = link.nextElementSibling?.textContent ?? '';
    count.textContent = (current + 1) + ' / ' + thumbnails.length;
  }

  for (const button of steps) {
    button.hidden = thumbnails.length < 2;
    button.addEventListener('click', () => show(current + Number(button.dataset.photoStep)));
  }
  thumbnails.forEach((link, index) => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      show(index);
      dialog.showModal();
    });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    touch = undefined;
    opener?.focus({preventScroll: true});
  });
  dialog.addEventListener('keydown', event => {
    if (thumbnails.length < 2 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || !event.isPrimary || event.target.closest('button')) return;
    touch = {id: event.pointerId, x: event.clientX, y: event.clientY};
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!touch || touch.id !== event.pointerId) return;
    const dx = event.clientX - touch.x;
    const dy = event.clientY - touch.y;
    touch = undefined;
    if (thumbnails.length > 1 && Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy)) {
      show(current + (dx < 0 ? 1 : -1));
    }
  });
  stage.addEventListener('pointercancel', () => { touch = undefined; });
})();
