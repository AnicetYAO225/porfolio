'use strict';

/* ---------- mobile nav toggle ---------- */
const navToggle = document.querySelector('[data-nav-toggle]');
const navList = document.querySelector('[data-nav-list]');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    navList.classList.toggle('open');
  });

  navList.querySelectorAll('[data-nav-link]').forEach((link) => {
    link.addEventListener('click', () => navList.classList.remove('open'));
  });
}

/* ---------- active nav link on scroll ---------- */
const navLinks = document.querySelectorAll('[data-nav-link]');
const sections = document.querySelectorAll('main section[id], .hero[id]');

if ('IntersectionObserver' in window && sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealEls.length) {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in-view'));
}

/* ---------- lightbox (projets sans lien externe) ---------- */
const lightbox = document.querySelector('[data-lightbox-overlay]');
const lightboxImg = document.querySelector('[data-lightbox-img]');
const lightboxCaption = document.querySelector('[data-lightbox-caption]');
const lightboxClose = document.querySelector('[data-lightbox-close]');
const lightboxTriggers = document.querySelectorAll('[data-lightbox]');

const openLightbox = (imgSrc, imgAlt, caption) => {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = imgSrc;
  lightboxImg.alt = imgAlt;
  if (lightboxCaption) lightboxCaption.textContent = caption;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

lightboxTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    const img = trigger.querySelector('img');
    const title = trigger.querySelector('.project-title');
    if (img) openLightbox(img.src, img.alt, title ? title.textContent : '');
  });
});

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) {
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
}
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});

/* ---------- portfolio filter ---------- */
const filterBtns = document.querySelectorAll('[data-filter-btn]');
const projectItems = document.querySelectorAll('[data-filter-item]');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;

    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    projectItems.forEach((item) => {
      const match = category === 'all' || item.dataset.category === category;
      item.classList.toggle('active', match);
    });
  });
});

/* ---------- contact form: validation + envoi réel (FormSubmit) ---------- */
const form = document.querySelector('[data-form]');
const formInputs = document.querySelectorAll('[data-form-input]');
const formBtn = document.querySelector('[data-form-btn]');
const formBtnLabel = formBtn ? formBtn.querySelector('span') : null;
const formStatus = document.querySelector('[data-form-status]');

if (form && formBtn) {
  formInputs.forEach((input) => {
    input.addEventListener('input', () => {
      formBtn.disabled = !form.checkValidity();
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) return;

    const ajaxUrl = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
    const originalLabel = formBtnLabel ? formBtnLabel.textContent : '';
    const sendingLabel = form.dataset.sendingLabel || 'Envoi en cours...';
    const successMsg = form.dataset.successMsg || 'Message envoyé — merci, je reviens vers vous rapidement.';
    const errorMsg = form.dataset.errorMsg || "L'envoi a échoué. Écrivez-moi directement à yao.anicet36@gmail.com.";

    formBtn.disabled = true;
    if (formBtnLabel) formBtnLabel.textContent = sendingLabel;
    if (formStatus) { formStatus.textContent = ''; formStatus.className = 'form-status'; }

    try {
      const response = await fetch(ajaxUrl, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });

      if (!response.ok) throw new Error('Réponse invalide du serveur');

      form.reset();
      formBtn.disabled = true;
      if (formStatus) {
        formStatus.textContent = successMsg;
        formStatus.className = 'form-status success';
      }
    } catch (err) {
      if (formStatus) {
        formStatus.textContent = errorMsg;
        formStatus.className = 'form-status error';
      }
      formBtn.disabled = false;
    } finally {
      if (formBtnLabel) formBtnLabel.textContent = originalLabel || 'Envoyer le message';
    }
  });
}

/* ---------- footer year ---------- */
const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- parcours: experience slider ---------- */
(() => {
  const root = document.querySelector('[data-track-slider]');
  if (!root) return;

  const viewport = root.querySelector('[data-track-viewport]');
  const track = root.querySelector('[data-track]');
  const items = Array.from(track.children);
  const prevBtn = root.querySelector('[data-track-prev]');
  const nextBtn = root.querySelector('[data-track-next]');
  const dotsWrap = root.querySelector('[data-track-dots]');
  const countCurrent = root.querySelector('[data-track-current]');
  const countTotal = root.querySelector('[data-track-total]');
  const AUTOPLAY_MS = 6500;
  let autoplayId = null;

  if (countTotal) countTotal.textContent = String(items.length).padStart(2, '0');

  const PAGE_SIZE = 2;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  let page = 0;

  if (countTotal) countTotal.textContent = String(items.length).padStart(2, '0');

  for (let p = 0; p < totalPages; p++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'track-dot' + (p === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to page ${p + 1}`);
    dot.addEventListener('click', () => { goTo(p); restartAutoplay(); });
    dotsWrap.appendChild(dot);
  }
  const dots = Array.from(dotsWrap.children);

  const updateCount = () => {
    if (!countCurrent) return;
    const start = page * PAGE_SIZE + 1;
    const end = Math.min(start + PAGE_SIZE - 1, items.length);
    const rangeText =
      start === end
        ? String(start).padStart(2, '0')
        : `${String(start).padStart(2, '0')}–${String(end).padStart(2, '0')}`;
    countCurrent.textContent = rangeText;
  };

  const goTo = (p) => {
    page = (p + totalPages) % totalPages;
    track.style.transform = `translateY(-${page * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle('active', di === page));
    updateCount();
  };

  const stopAutoplay = () => { if (autoplayId) { clearInterval(autoplayId); autoplayId = null; } };
  const startAutoplay = () => {
    stopAutoplay();
    if (totalPages < 2) return;
    autoplayId = setInterval(() => goTo(page + 1), AUTOPLAY_MS);
  };
  const restartAutoplay = () => startAutoplay();

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(page - 1); restartAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(page + 1); restartAutoplay(); });

  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', startAutoplay);

  root.setAttribute('tabindex', '0');
  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); goTo(page - 1); restartAutoplay(); }
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); goTo(page + 1); restartAutoplay(); }
  });

  let touchStartY = null;
  viewport.addEventListener('touchstart', (event) => { touchStartY = event.touches[0].clientY; }, { passive: true });
  viewport.addEventListener('touchend', (event) => {
    if (touchStartY === null) return;
    const diff = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? page - 1 : page + 1); restartAutoplay(); }
    touchStartY = null;
  });

  const syncHeight = () => {
    const grid = document.querySelector('.parcours-grid');
    if (!grid || grid.children.length < 2) return;
    const eduCol = grid.children[0];
    const expCol = grid.children[1];

    // On mobile the grid collapses to a single column, so the two columns
    // no longer share the same top — in that case let the slider size itself.
    const sameRow = Math.abs(eduCol.getBoundingClientRect().top - expCol.getBoundingClientRect().top) < 2;
    if (!sameRow) { root.style.height = ''; return; }

    const eduHeight = eduCol.getBoundingClientRect().height;
    // root (.track-slider) sits below its own "Expérience" heading inside
    // expCol, so subtract that offset to make both column bottoms align.
    const headerOffset = root.getBoundingClientRect().top - expCol.getBoundingClientRect().top;
    const targetHeight = eduHeight - headerOffset;

    if (targetHeight > 0) root.style.height = `${targetHeight}px`;
  };

  // Apply immediately (script runs after DOM is parsed) so there is no flash
  // of the full unclipped list, then keep it accurate as content/fonts settle.
  syncHeight();
  window.addEventListener('resize', syncHeight);
  window.addEventListener('load', syncHeight);
  if ('fonts' in document) document.fonts.ready.then(syncHeight);
  if ('ResizeObserver' in window) {
    const grid = document.querySelector('.parcours-grid');
    if (grid && grid.children.length > 1) {
      new ResizeObserver(syncHeight).observe(grid.children[0]);
    }
  }

  goTo(0);
  startAutoplay();
})();
