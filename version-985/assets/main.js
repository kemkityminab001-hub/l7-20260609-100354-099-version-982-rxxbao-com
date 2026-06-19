(function() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var showSlide = function(next) {
      if (!slides.length) {
        return;
      }
      active = (next + slides.length) % slides.length;
      slides.forEach(function(slide, index) {
        slide.classList.toggle('is-active', index === active);
      });
      dots.forEach(function(dot, index) {
        dot.classList.toggle('is-active', index === active);
      });
    };
    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
      });
    });
    window.setInterval(function() {
      showSlide(active + 1);
    }, 5200);
  }

  var grid = document.querySelector('[data-filter-grid]');
  var input = document.querySelector('[data-filter-input]');
  var year = document.querySelector('[data-year-filter]');
  var type = document.querySelector('[data-type-filter]');
  var empty = document.querySelector('[data-empty-state]');

  if (grid && input) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q');
    if (queryValue) {
      input.value = queryValue;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.js-card'));
    var normalize = function(value) {
      return String(value || '').trim().toLowerCase();
    };
    var applyFilter = function() {
      var query = normalize(input.value);
      var selectedYear = year ? normalize(year.value) : '';
      var selectedType = type ? normalize(type.value) : '';
      var visible = 0;
      cards.forEach(function(card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
        var matchType = !selectedType || normalize(card.dataset.type).indexOf(selectedType) !== -1;
        var matched = matchQuery && matchYear && matchType;
        card.classList.toggle('is-hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };
    input.addEventListener('input', applyFilter);
    if (year) {
      year.addEventListener('change', applyFilter);
    }
    if (type) {
      type.addEventListener('change', applyFilter);
    }
    applyFilter();
  }
}());
