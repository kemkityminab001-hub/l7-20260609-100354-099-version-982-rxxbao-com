(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const thumbs = Array.from(hero.querySelectorAll('[data-hero-thumb]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const setActive = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, itemIndex) => slide.classList.toggle('is-active', itemIndex === current));
      dots.forEach((dot, itemIndex) => dot.classList.toggle('is-active', itemIndex === current));
      thumbs.forEach((thumb, itemIndex) => thumb.classList.toggle('is-active', itemIndex === current));
    };

    const restart = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => setActive(current + 1), 5200);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        setActive(index);
        restart();
      });
    });

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        setActive(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        setActive(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        setActive(current + 1);
        restart();
      });
    }

    restart();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const input = filterPanel.querySelector('[data-filter-input]');
    const region = filterPanel.querySelector('[data-region-filter]');
    const type = filterPanel.querySelector('[data-type-filter]');
    const year = filterPanel.querySelector('[data-year-filter]');
    const count = filterPanel.querySelector('[data-filter-count]');
    const cards = Array.from(document.querySelectorAll('.searchable-card'));

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const filter = () => {
      const query = normalize(input ? input.value : '');
      const selectedRegion = normalize(region ? region.value : '');
      const selectedType = normalize(type ? type.value : '');
      const selectedYear = normalize(year ? year.value : '');
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        const matched = (!query || haystack.includes(query))
          && (!selectedRegion || normalize(card.dataset.region) === selectedRegion)
          && (!selectedType || normalize(card.dataset.type) === selectedType)
          && (!selectedYear || normalize(card.dataset.year) === selectedYear);

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = `当前显示 ${visible} 部影片`;
      }
    };

    [input, region, type, year].filter(Boolean).forEach((item) => {
      item.addEventListener('input', filter);
      item.addEventListener('change', filter);
    });

    filter();
  }

  const player = document.querySelector('[data-player]');

  if (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    let hls = null;
    let attached = false;

    const attach = () => {
      if (!video || attached) {
        return;
      }

      const source = video.dataset.hls;

      if (!source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        attached = true;
      }
    };

    const start = () => {
      attach();
      if (button) {
        button.classList.add('is-hidden');
      }
      if (video) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', () => {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', () => {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
