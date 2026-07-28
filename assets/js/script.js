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
