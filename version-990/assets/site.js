(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.getElementById('mobileNav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === activeSlide);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === activeSlide);
        });
    }

    function startCarousel() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            window.clearInterval(timer);
            showSlide(Number(dot.getAttribute('data-slide')) || 0);
            startCarousel();
        });
    });

    startCarousel();

    var grid = document.getElementById('movieGrid');
    if (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var searchInput = document.getElementById('searchInput');
        var categoryFilter = document.getElementById('categoryFilter');
        var yearFilter = document.getElementById('yearFilter');
        var regionFilter = document.getElementById('regionFilter');
        var typeFilter = document.getElementById('typeFilter');
        var params = new URLSearchParams(window.location.search);
        var initialSearch = params.get('q');

        if (initialSearch && searchInput) {
            searchInput.value = initialSearch;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var q = normalize(searchInput && searchInput.value);
            var category = normalize(categoryFilter && categoryFilter.value);
            var year = normalize(yearFilter && yearFilter.value);
            var region = normalize(regionFilter && regionFilter.value);
            var type = normalize(typeFilter && typeFilter.value);

            cards.forEach(function (card) {
                var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type'));
                var ok = true;
                if (q && text.indexOf(q) === -1) {
                    ok = false;
                }
                if (category && normalize(card.getAttribute('data-category')) !== category) {
                    ok = false;
                }
                if (year && normalize(card.getAttribute('data-year')) !== year) {
                    ok = false;
                }
                if (region && normalize(card.getAttribute('data-region')) !== region) {
                    ok = false;
                }
                if (type && normalize(card.getAttribute('data-type')) !== type) {
                    ok = false;
                }
                card.classList.toggle('is-hidden', !ok);
            });
        }

        [searchInput, categoryFilter, yearFilter, regionFilter, typeFilter].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilters);
                field.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }
}());

function initMoviePlayer(sourceUrl) {
    var video = document.getElementById('movie-video');
    var overlay = document.querySelector('.player-overlay');
    var hlsInstance = null;
    var prepared = false;

    if (!video || !sourceUrl) {
        return;
    }

    function prepare() {
        if (prepared) {
            return;
        }
        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function play() {
        prepare();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
