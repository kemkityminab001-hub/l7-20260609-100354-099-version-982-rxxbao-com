(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-button");
        var mobileNav = document.querySelector(".mobile-nav");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("open");
                menuButton.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var hero = document.querySelector("[data-hero-slider]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var active = 0;
            var timer = null;

            function showSlide(index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("current", i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === active);
                });
            }

            function startTimer() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    showSlide(active + 1);
                }, 5600);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                    startTimer();
                });
            });

            startTimer();
        }

        document.querySelectorAll("[data-rail]").forEach(function (rail) {
            var track = rail.querySelector(".rail-track");
            var prev = rail.querySelector(".rail-prev");
            var next = rail.querySelector(".rail-next");
            if (!track) {
                return;
            }
            var move = function (direction) {
                track.scrollBy({
                    left: direction * Math.max(280, track.clientWidth * 0.82),
                    behavior: "smooth"
                });
            };
            if (prev) {
                prev.addEventListener("click", function () {
                    move(-1);
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    move(1);
                });
            }
        });

        var results = document.getElementById("search-results");
        var input = document.getElementById("search-input");
        var form = document.getElementById("search-form");
        var genreFilter = document.getElementById("genre-filter");
        var yearFilter = document.getElementById("year-filter");
        if (results && input && window.movieSearchIndex) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            input.value = initial;

            function render(items) {
                results.innerHTML = items.slice(0, 80).map(function (movie) {
                    var tags = movie.tags.slice(0, 3).map(function (tag) {
                        return "<span>" + escapeHtml(tag) + "</span>";
                    }).join("");
                    return [
                        "<a class="movie-card" href="" + movie.url + "">",
                        "<div class="card-media"><img src="" + movie.cover + "" alt="" + escapeHtml(movie.title) + "" loading="lazy"><span class="card-badge">" + escapeHtml(movie.category) + "</span></div>",
                        "<div class="card-body"><h3>" + escapeHtml(movie.title) + "</h3>",
                        "<div class="card-meta"><span>" + escapeHtml(movie.yearText) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
                        "<p>" + escapeHtml(movie.oneLine) + "</p><div class="tag-row">" + tags + "</div></div></a>"
                    ].join("");
                }).join("");
            }

            function escapeHtml(value) {
                return String(value || "").replace(/[&<>"']/g, function (match) {
                    return {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        """: "&quot;",
                        "'": "&#39;"
                    }[match];
                });
            }

            function applySearch(event) {
                if (event) {
                    event.preventDefault();
                }
                var query = input.value.trim().toLowerCase();
                var genre = genreFilter ? genreFilter.value : "";
                var minYear = yearFilter && yearFilter.value ? parseInt(yearFilter.value, 10) : 0;
                var items = window.movieSearchIndex.filter(function (movie) {
                    var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.category, movie.yearText].concat(movie.tags).join(" ").toLowerCase();
                    var passQuery = !query || haystack.indexOf(query) !== -1;
                    var passGenre = !genre || haystack.indexOf(genre.toLowerCase()) !== -1;
                    var passYear = !minYear || Number(movie.year) >= minYear;
                    return passQuery && passGenre && passYear;
                });
                render(items);
            }

            form.addEventListener("submit", applySearch);
            input.addEventListener("input", applySearch);
            if (genreFilter) {
                genreFilter.addEventListener("change", applySearch);
            }
            if (yearFilter) {
                yearFilter.addEventListener("change", applySearch);
            }
            applySearch();
        }
    });
})();
