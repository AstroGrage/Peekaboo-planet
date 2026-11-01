document.addEventListener('DOMContentLoaded', () => {
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const planetStories = {
    play: {
      title: 'Play that leads to growth',
      text: 'Purposeful play helps young children build language, movement, confidence and joy in learning from the very start.'
    },
    learning: {
      title: 'Learning with a clear next step',
      text: 'Our programmes balance structure and discovery so children can develop literacy, numeracy, problem-solving and independence with confidence.'
    },
    care: {
      title: 'Care that nurtures belonging',
      text: 'Warm routines, healthy nutrition and strong family communication help children feel secure, seen and supported every day.'
    }
  };

  const storyPanel = document.getElementById('planet-story-panel');
  const chips = document.querySelectorAll('.planet-chip');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.target;
      const story = planetStories[key];
      if (!story) return;
      chips.forEach((button) => button.classList.toggle('active', button === chip));
      if (!storyPanel) return;
      storyPanel.innerHTML = `
        <h3>${story.title}</h3>
        <p>${story.text}</p>
      `;
    });
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const galleryTiles = document.querySelectorAll('.gallery-tile');
  const closeLightbox = document.querySelector('.lightbox-close');

  galleryTiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      if (!lightbox || !lightboxImage || !lightboxCaption) return;
      const image = tile.dataset.image;
      const caption = tile.dataset.caption;
      lightboxImage.src = image;
      lightboxImage.alt = caption;
      lightboxCaption.textContent = caption;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  const closeModal = (modal) => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  };

  if (closeLightbox && lightbox) {
    closeLightbox.addEventListener('click', () => closeModal(lightbox));
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeModal(lightbox);
    });
  }

  const modal = document.getElementById('program-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalAge = document.getElementById('modal-age');
  const modalSummary = document.getElementById('modal-summary');
  const modalPoints = document.getElementById('modal-points');
  const modalClose = document.querySelector('.program-modal-close');

  document.querySelectorAll('.program-link').forEach((button) => {
    button.addEventListener('click', () => {
      if (!modal || !modalTitle || !modalAge || !modalSummary || !modalPoints) return;
      modalTitle.textContent = button.dataset.title;
      modalAge.textContent = button.dataset.age;
      modalSummary.textContent = button.dataset.summary;
      modalPoints.innerHTML = '';
      button.dataset.points.split(';').forEach((point) => {
        const li = document.createElement('li');
        li.textContent = point.trim();
        modalPoints.appendChild(li);
      });
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  if (modalClose && modal) {
    modalClose.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (lightbox) closeModal(lightbox);
      if (modal) closeModal(modal);
    }
  });

  // The template's Bootstrap JavaScript bundle is not included, so keep the
  // existing mobile navigation button working with a small accessible toggle.
  const navToggle = document.querySelector('.navbar-toggler');
  const navMenu = document.getElementById('mainNav');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const gallery = document.getElementById('galleryCarousel');
  document.querySelectorAll('[data-gallery-step]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!gallery) return;
      const firstCard = gallery.querySelector('.gallery-tile');
      const gap = parseFloat(getComputedStyle(gallery).gap) || 16;
      const distance = firstCard ? firstCard.getBoundingClientRect().width + gap : gallery.clientWidth * 0.8;
      gallery.scrollBy({ left: Number(button.dataset.galleryStep) * distance, behavior: 'smooth' });
    });
  });

  // Keep the documented Facebook presence and the centre's WhatsApp number
  // easy to find from every page footer.
  document.querySelectorAll('.footer .container').forEach((footer) => {
    if (footer.querySelector('.footer-socials')) return;
    const socials = document.createElement('nav');
    socials.className = 'footer-socials';
    socials.setAttribute('aria-label', 'Connect with Peekaboo Planet');
    socials.innerHTML = '<span class="footer-socials-label">Connect with us</span><a href="https://www.facebook.com/search/pages/?q=Peekaboo%20Planet%20Daycare%20Centre" target="_blank" rel="noreferrer">Facebook</a><a href="https://wa.me/27825454339" target="_blank" rel="noreferrer">WhatsApp</a>';
    const footerBottom = footer.querySelector('.footer-bottom');
    if (footerBottom) footer.insertBefore(socials, footerBottom);
    else footer.appendChild(socials);
  });
});
