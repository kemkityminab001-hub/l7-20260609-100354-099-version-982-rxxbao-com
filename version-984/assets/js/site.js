(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
            button.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            slides[index].classList.remove('active');
            if (dots[index]) {
                dots[index].classList.remove('active');
            }
            index = next;
            slides[index].classList.add('active');
            if (dots[index]) {
                dots[index].classList.add('active');
            }
        }
        dots.forEach(function (dot, next) {
            dot.addEventListener('click', function () {
                show(next);
            });
        });
        window.setInterval(function () {
            show((index + 1) % slides.length);
        }, 5600);
    }

    function setupSearch() {
        var forms = selectAll('[data-search-form]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[type="search"]');
                var query = input ? input.value.trim().toLowerCase() : '';
                var list = form.closest('main') || document;
                var cards = selectAll('[data-movie-card]', list);
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
                    card.hidden = query && haystack.indexOf(query) === -1;
                });
                var target = document.querySelector('[data-card-list]');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    function setupFilters() {
        var bars = selectAll('[data-filter-bar]');
        bars.forEach(function (bar) {
            var buttons = selectAll('[data-type-filter]', bar);
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    buttons.forEach(function (item) {
                        item.classList.remove('active');
                    });
                    button.classList.add('active');
                    var value = button.getAttribute('data-type-filter') || '';
                    var root = bar.closest('main') || document;
                    var cards = selectAll('[data-movie-card]', root);
                    cards.forEach(function (card) {
                        var type = card.getAttribute('data-type') || '';
                        card.hidden = value && type.indexOf(value) === -1;
                    });
                });
            });
        });
    }

    function setupImages() {
        selectAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-empty');
            });
        });
    }

    window.setupMoviePlayer = function (url) {
        var card = document.querySelector('[data-player]');
        if (!card) {
            return;
        }
        var video = card.querySelector('video');
        var overlay = card.querySelector('.player-overlay');
        if (!video || !overlay) {
            return;
        }
        var ready = false;
        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }
        function play() {
            attach();
            overlay.classList.add('is-hidden');
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupFilters();
        setupImages();
    });
})();
