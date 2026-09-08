(() => {
  'use strict';

  const includePartials = async () => {
    const parts = document.querySelectorAll('[data-include]');

    for (const part of parts) {
      const source = part.getAttribute('data-include');

      try {
        const response = await fetch(source, { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(`Could not load ${source}`);
        }

        part.outerHTML = await response.text();
      } catch (error) {
        console.error(error);
      }
    }

    initSite();
  };

  function initSite() {
    const nav = document.querySelector('.nav');
    const menuButton = document.querySelector('.menu-button');

    const ageCheck = document.getElementById('ageCheck');
    const matureContent = document.getElementById('matureContent');
    const enterAge = document.getElementById('enterAge');
    const hideMature = document.getElementById('hideMature');

    const galleryVerification = document.getElementById('galleryVerification');
    const galleryEnter = document.getElementById('galleryEnter');
    const matureGallery = document.getElementById('matureGallery');

    const form = document.getElementById('commission-form');
    const formMessage = document.getElementById('form-message');
    const typeSelect = document.getElementById('commission-type');

    menuButton?.addEventListener('click', () => {
      if (!nav) return;

      const isOpen = nav.classList.toggle('open');

      menuButton.setAttribute(
        'aria-expanded',
        String(isOpen)
      );
    });

    nav?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuButton?.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', event => {
      if (!nav || !menuButton) return;

      if (
        nav.classList.contains('open') &&
        !nav.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });

    const introBackground = document.querySelector('.intro-background');

    if (introBackground) {
      const image = new Image();

      image.onload = () => {
        introBackground.style.backgroundImage = `
          linear-gradient(
            rgba(0, 0, 0, 0.63),
            rgba(0, 0, 0, 0.82)
          ),
          url("images/landing-artwork.jpg")
        `;

        introBackground.classList.add('has-background');
      };

      image.onerror = () => {
        console.info(
          'images/landing-artwork.jpg not found. Keeping fallback background.'
        );
      };

      image.src = 'images/landing-artwork.jpg';
    }

    const isAdult = () =>
      sessionStorage.getItem('javorinaMaria18Plus') === 'yes';

    function revealMainNSFW() {
      if (!ageCheck || !matureContent) return;

      ageCheck.style.display = 'none';
      matureContent.classList.add('shown');
      matureContent.setAttribute('aria-hidden', 'false');
    }

    function hideMainNSFW() {
      if (!ageCheck || !matureContent) return;

      ageCheck.style.display = 'flex';
      matureContent.classList.remove('shown');
      matureContent.setAttribute('aria-hidden', 'true');
      sessionStorage.removeItem('javorinaMaria18Plus');
    }

    function revealGalleryNSFW() {
      if (!galleryVerification || !matureGallery) return;

      galleryVerification.style.display = 'none';
      matureGallery.classList.add('shown');
      matureGallery.setAttribute('aria-hidden', 'false');
    }

    if (isAdult()) {
      revealMainNSFW();
      revealGalleryNSFW();
    }

    enterAge?.addEventListener('click', () => {
      sessionStorage.setItem('javorinaMaria18Plus', 'yes');
      revealMainNSFW();
    });

    hideMature?.addEventListener('click', () => {
      hideMainNSFW();

      document.getElementById('mature')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });

    galleryEnter?.addEventListener('click', () => {
      sessionStorage.setItem('javorinaMaria18Plus', 'yes');
      revealGalleryNSFW();
    });

    document.querySelectorAll('[data-price]').forEach(button => {
      button.addEventListener('click', () => {
        if (!typeSelect) return;

        typeSelect.value = button.dataset.price || '';
      });
    });

    const discordWebhookUrl =
      'https://discord.com/api/webhooks/1543966349947314176/L5TR0pJAx3g9_GSuWqq1F_30bH8zDCXOl7oS23uMKoyepks8l-jX6vYJ_Le0IE7eZWi2';

    form?.addEventListener('submit', async event => {
      event.preventDefault();

      if (!formMessage) return;

      const discordUsername =
        document.getElementById('discord-username')?.value.trim() || '';
      const commissionType =
        document.getElementById('commission-type')?.value.trim() || '';
      const description =
        form.querySelector('[name="description"]')?.value.trim() || '';

      if (!discordUsername || !commissionType || !description) {
        formMessage.textContent = 'Please fill out all fields.';
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'SENDING…';
      }

      formMessage.textContent = 'Sending your commission request…';

      const message = [
        '**PIENIĄDZE OD SOROSA!!!! NOWY KOMISZ!!!**',
        '',
        `**Nazwa Discord:** ${discordUsername}`,
        '',
        `**Typ:** ${commissionType}`,
        '',
        `**Opis komisza:** ${description}`
      ].join('\n');

      try {
        const response = await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: message
          })
        });

        if (!response.ok) {
          throw new Error(`Discord webhook returned ${response.status}`);
        }

        form.reset();
        formMessage.textContent = 'Commission request sent successfully!';
      } catch (error) {
        console.error('Could not send commission request:', error);
        formMessage.textContent =
          'Could not send the request. Please try again later.';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'SEND COMMISSION REQUEST';
        }
      }
    });

    const popup = document.createElement('div');
    popup.className = 'image-popup';
    popup.id = 'imagePopup';
    popup.setAttribute('aria-hidden', 'true');

    popup.innerHTML = `
      <div class="image-popup-box">
        <img class="image-popup-image" id="popupImage" alt="artwork">
        <button class="image-popup-close" id="closePopup" type="button" aria-label="Close image">
          &times;
        </button>
      </div>
    `;

    document.body.appendChild(popup);

    const popupImage = document.getElementById('popupImage');
    const closePopup = document.getElementById('closePopup');

    function openImage(image) {
      if (!popupImage) return;

      popupImage.src = image.src;
      popupImage.alt = 'artwork';

      popup.classList.add('show');
      popup.setAttribute('aria-hidden', 'false');
      document.body.classList.add('popup-open');
    }

    function closeImage() {
      popup.classList.remove('show');
      popup.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('popup-open');

      if (popupImage) {
        popupImage.src = '';
      }
    }

    document.querySelectorAll('.art-image, .gallery-image img, .price-tier-image').forEach(image => {
      image.addEventListener('click', () => {
        openImage(image);
      });
    });

    closePopup?.addEventListener('click', closeImage);

    popup?.addEventListener('click', event => {
      if (event.target === popup) {
        closeImage();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && popup.classList.contains('show')) {
        closeImage();
      }
    });

    document.querySelectorAll('[data-carousel]').forEach(carousel => {
      const viewport = carousel.querySelector('.gallery-viewport');
      const track = carousel.querySelector('.gallery-track');
      const slides = Array.from(carousel.querySelectorAll('.gallery-image'));
      const previous = carousel.querySelector('.gallery-arrow-prev');
      const next = carousel.querySelector('.gallery-arrow-next');

      if (!viewport || !track || slides.length < 3) return;

      let activeIndex = Math.min(1, slides.length - 1);

      const update = (animate = true) => {
        const activeSlide = slides[activeIndex];
        if (!activeSlide) return;

        // Use the slide's layout geometry, not getBoundingClientRect().width.
        // getBoundingClientRect() includes the CSS scale used for inactive slides,
        // so using it made the step slightly smaller after every click and caused
        // the carousel to drift farther off-center as the user moved through it.
        // offsetLeft/offsetWidth stay based on the unscaled flex layout.
        const slideCenter = activeSlide.offsetLeft + activeSlide.offsetWidth / 2;
        const offset = viewport.clientWidth / 2 - slideCenter;

        track.classList.toggle('no-transition', !animate);
        track.style.setProperty('--carousel-offset', `${offset}px`);
        track.style.paddingLeft = '0px';
        track.style.paddingRight = '0px';

        slides.forEach((slide, index) => {
          const active = index === activeIndex;
          slide.classList.toggle('is-active', active);
          slide.setAttribute('aria-current', active ? 'true' : 'false');
        });

        if (previous) previous.disabled = activeIndex <= 0;
        if (next) next.disabled = activeIndex >= slides.length - 1;
      };

      previous?.addEventListener('click', () => {
        if (activeIndex > 0) {
          activeIndex -= 1;
          update();
        }
      });

      next?.addEventListener('click', () => {
        if (activeIndex < slides.length - 1) {
          activeIndex += 1;
          update();
        }
      });

      let touchStartX = null;

      viewport.addEventListener('touchstart', event => {
        touchStartX = event.changedTouches[0].clientX;
      }, { passive: true });

      viewport.addEventListener('touchend', event => {
        if (touchStartX === null) return;

        const deltaX = event.changedTouches[0].clientX - touchStartX;
        touchStartX = null;

        if (Math.abs(deltaX) < 45) return;

        if (deltaX < 0 && activeIndex < slides.length - 1) {
          activeIndex += 1;
          update();
        } else if (deltaX > 0 && activeIndex > 0) {
          activeIndex -= 1;
          update();
        }
      }, { passive: true });

      let wheelLock = false;
      viewport.addEventListener('wheel', event => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        if (wheelLock) {
          event.preventDefault();
          return;
        }

        const direction = event.deltaY > 0 ? 1 : -1;
        const nextIndex = Math.max(0, Math.min(slides.length - 1, activeIndex + direction));

        if (nextIndex === activeIndex) return;

        event.preventDefault();
        activeIndex = nextIndex;
        update();
        wheelLock = true;
        window.setTimeout(() => { wheelLock = false; }, 450);
      }, { passive: false });

      carousel.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' && activeIndex > 0) {
          event.preventDefault();
          activeIndex -= 1;
          update();
        } else if (event.key === 'ArrowRight' && activeIndex < slides.length - 1) {
          event.preventDefault();
          activeIndex += 1;
          update();
        }
      });

      window.addEventListener('resize', () => update(false));
      update(false);
    });

    const sectionsToWatch = ['gallery', 'mature', 'prices', 'contact'];

    const sections = sectionsToWatch
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (sections.length) {
      const observer = new IntersectionObserver(
        entries => {
          const shown = entries
            .filter(entry => entry.isIntersecting)
            .sort(
              (a, b) =>
                b.intersectionRatio - a.intersectionRatio
            )[0];

          if (!shown) return;

          document.querySelectorAll('.nav a').forEach(link => {
            link.classList.toggle(
              'active',
              link.dataset.nav === shown.target.id
            );
          });
        },
        {
          threshold: [0.2, 0.4, 0.6]
        }
      );

      sections.forEach(section => observer.observe(section));
    }

    document.querySelector('.see-work-button')?.addEventListener(
      'click',
      event => {
        const target = document.getElementById('gallery');

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    );
  }

  includePartials();
})();
