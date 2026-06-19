(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function bindFilters() {
    var form = document.querySelector('[data-filter-form]');
    var list = document.querySelector('[data-movie-list]');
    if (!form || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');

    function apply() {
      var keyword = normalize(form.elements.keyword && form.elements.keyword.value);
      var region = normalize(form.elements.region && form.elements.region.value);
      var type = normalize(form.elements.type && form.elements.type.value);
      var year = normalize(form.elements.year && form.elements.year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && normalize(card.dataset.region) !== region) {
          matched = false;
        }
        if (type && normalize(card.dataset.type) !== type) {
          matched = false;
        }
        if (year && normalize(card.dataset.year) !== year) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    apply();
  }

  function bindAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var target = document.querySelector(link.getAttribute('href'));
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function preparePlayer(source) {
    var video = document.getElementById('movie-player');
    var cover = document.getElementById('player-cover');
    var started = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function load() {
      if (started) {
        return;
      }
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      load();
      if (cover) {
        cover.classList.add('hidden');
      }
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!started) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.SitePlayer = {
    init: preparePlayer
  };

  bindFilters();
  bindAnchorScroll();
})();
