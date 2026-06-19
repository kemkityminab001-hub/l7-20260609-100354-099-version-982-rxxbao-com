(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 6200);
  }

  function filterCards(root, keyword, year) {
    var cards = root.querySelectorAll('.movie-card');
    var cleanKeyword = (keyword || '').trim().toLowerCase();

    cards.forEach(function (card) {
      var searchText = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var keywordMatched = !cleanKeyword || searchText.indexOf(cleanKeyword) !== -1;
      var yearMatched = !year || year === 'all' || cardYear === year;

      card.classList.toggle('hidden-by-filter', !(keywordMatched && yearMatched));
    });
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

  function resolveFilterScope(input) {
    var filterBar = input.closest('.filter-bar');

    if (filterBar && filterBar.parentElement) {
      var scoped = filterBar.parentElement.querySelector('.filter-scope');

      if (scoped) {
        return scoped;
      }
    }

    return document;
  }

  filterInputs.forEach(function (input) {
    var scope = resolveFilterScope(input);
    var activeYear = 'all';
    var filterBar = input.closest('.filter-bar');
    var chips = filterBar ? Array.prototype.slice.call(filterBar.querySelectorAll('[data-year-filter]')) : [];

    input.addEventListener('input', function () {
      filterCards(scope, input.value, activeYear);
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeYear = chip.getAttribute('data-year-filter') || 'all';

        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });

        filterCards(scope, input.value, activeYear);
      });
    });
  });

  var playerShell = document.querySelector('.player-shell');

  if (playerShell) {
    var video = playerShell.querySelector('video');
    var cover = playerShell.querySelector('.player-cover');
    var source = playerShell.getAttribute('data-video-url');
    var started = false;
    var hlsInstance = null;

    function attachSource() {
      if (!video || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayer() {
      if (!video || started) {
        return;
      }

      started = true;
      attachSource();
      video.setAttribute('controls', 'controls');

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          started = false;
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayer);
    }

    if (video) {
      video.addEventListener('click', startPlayer);
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
