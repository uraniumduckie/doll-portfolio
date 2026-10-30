document.getElementById('year').textContent = new Date().getFullYear();

const menu = document.querySelector('.menu-button');
const nav = document.querySelector('nav');
const menuLabel = (open) => document.documentElement.lang === 'en'
  ? (open ? 'Close navigation' : 'Open navigation')
  : (open ? 'Закрыть навигацию' : 'Открыть навигацию');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!open));
  menu.setAttribute('aria-label', menuLabel(!open));
  nav.classList.toggle('is-open', !open);
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', menuLabel(false));
    nav.classList.remove('is-open');
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const grid = document.querySelector('.photo-grid');

if (grid) {
  const folder = grid.dataset.folder;
  const photos = Array.isArray(window.GALLERY_PHOTOS) ? window.GALLERY_PHOTOS : [];

  if (photos.length === 0) {
    grid.classList.add('is-empty');
    grid.innerHTML =
      '<p class="grid-empty">Фото пока не добавлены. Положи их в <b>' +
      folder +
      '/</b> (любые имена) и запусти <b>build-galleries.bat</b>, затем обнови страницу.</p>';
  } else {
    const photoUrl = (name) => folder + '/' + encodeURIComponent(name);

    const items = photos.map((name, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'photo-item reveal';
      button.dataset.index = String(index);
      button.setAttribute('aria-label', 'Открыть фото ' + (index + 1));

      const img = document.createElement('img');
      img.alt = '';
      img.loading = 'lazy';
      img.src = photoUrl(name);
      img.addEventListener('load', () => img.classList.add('is-loaded'));
      if (img.complete && img.naturalWidth > 0) img.classList.add('is-loaded');
      img.addEventListener('error', () => button.remove());

      button.appendChild(img);
      grid.appendChild(button);
      revealObserver.observe(button);
      return button;
    });

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.hidden = true;
    lightbox.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Закрыть">×</button>' +
      '<button class="lightbox-prev" type="button" aria-label="Предыдущее фото">‹</button>' +
      '<img alt="" />' +
      '<button class="lightbox-next" type="button" aria-label="Следующее фото">›</button>' +
      '<span class="lightbox-counter"></span>';
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const counter = lightbox.querySelector('.lightbox-counter');
    let current = 0;

    const show = (index) => {
      current = (index + photos.length) % photos.length;
      lightboxImg.classList.remove('is-loaded');
      lightboxImg.alt = 'Фото ' + (current + 1);
      lightboxImg.src = photoUrl(photos[current]);
      counter.textContent = current + 1 + ' / ' + photos.length;
    };
    lightboxImg.addEventListener('load', () => lightboxImg.classList.add('is-loaded'));

    const open = (index) => {
      show(index);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    };

    grid.addEventListener('click', (event) => {
      const item = event.target.closest('.photo-item');
      if (item) open(Number(item.dataset.index));
    });
    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) close();
    });
    document.addEventListener('keydown', (event) => {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') show(current - 1);
      if (event.key === 'ArrowRight') show(current + 1);
    });
  }
}

const slideshow = document.querySelector('.favorites-slideshow');

if (slideshow) {
  const folder = slideshow.dataset.folder;
  const photos = Array.isArray(window.GALLERY_PHOTOS) ? window.GALLERY_PHOTOS : [];

  if (photos.length === 0) {
    slideshow.innerHTML =
      '<p class="slideshow-empty">Фото пока не добавлены. Положи их в <b>' +
      folder +
      '/</b> (любые имена) и запусти <b>build-galleries.bat</b>, затем обнови страницу.</p>';
  } else {
    const photoUrl = (name) => folder + '/' + encodeURIComponent(name);

    let current = 0;
    let timer = null;

    const slides = photos.map((name, index) => {
      const slide = document.createElement('figure');
      slide.className = 'slideshow-slide';
      const img = document.createElement('img');
      img.src = photoUrl(name);
      img.alt = 'Кукла ' + (index + 1);
      img.loading = index === 0 ? 'eager' : 'lazy';
      slide.appendChild(img);
      slide.addEventListener('mouseenter', () => {
        if (index === current) stop();
      });
      slide.addEventListener('mouseleave', () => start());
      return slide;
    });

    const positions = (index) => {
      let offset = index - current;
      const total = slides.length;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
      const abs = Math.abs(offset);
      if (offset === 0) return { shift: 0, scale: 1, fade: 1, z: 3 };
      if (abs === 1) return { shift: offset, scale: 0.82, fade: 0.5, z: 2 };
      return { shift: offset > 0 ? 1.7 : -1.7, scale: 0.6, fade: 0, z: 1 };
    };

    const apply = (slide, index) => {
      const p = positions(index);
      slide.style.setProperty('--shift', p.shift);
      slide.style.setProperty('--scale', p.scale);
      slide.style.setProperty('--fade', p.fade);
      slide.style.zIndex = p.z;
    };

    slides.forEach((slide, index) => {
      apply(slide, index);
      slide.classList.toggle('is-active', index === current);
      slideshow.appendChild(slide);
    });

    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'slideshow-dots';
    const dots = photos.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slideshow-dot' + (index === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Показать фото ' + (index + 1));
      dot.addEventListener('click', () => go(index));
      dotsWrap.appendChild(dot);
      return dot;
    });
    slideshow.appendChild(dotsWrap);

    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.className = 'slideshow-control slideshow-prev';
    prevButton.setAttribute('aria-label', 'Предыдущий слайд');
    prevButton.textContent = '‹';
    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'slideshow-control slideshow-next';
    nextButton.setAttribute('aria-label', 'Следующий слайд');
    nextButton.textContent = '›';
    slideshow.appendChild(prevButton);
    slideshow.appendChild(nextButton);

    const layout = () => {
      slides.forEach((slide, index) => {
        apply(slide, index);
        slide.classList.toggle('is-active', index === current);
      });
      dots.forEach((dot, index) =>
        dot.classList.toggle('is-active', index === current)
      );
    };

    const go = (index) => {
      const next = (index + slides.length) % slides.length;
      if (next === current) return;
      current = next;
      layout();
    };

    const advance = (step) => () => {
      stop();
      go(current + step);
    };

    const start = () => {
      if (timer || slides.length < 2) return;
      timer = window.setInterval(() => go(current + 1), 3000);
    };
    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    nextButton.addEventListener('click', advance(1));
    prevButton.addEventListener('click', advance(-1));
    slideshow.addEventListener('focusin', stop);
    slideshow.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    start();
  }
}

