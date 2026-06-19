(function () {
    const root = document.body.dataset.root || ".";

    function goToSearch(form) {
        const input = form.querySelector('input[name="q"]');
        const query = input ? input.value.trim() : "";
        if (!query) {
            return;
        }
        window.location.href = `${root}/videos.html?q=${encodeURIComponent(query)}`;
    }

    document.querySelectorAll("[data-site-search]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            goToSearch(form);
        });
    });

    const mobileToggle = document.querySelector("[data-mobile-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");
    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", () => {
            mobilePanel.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero-carousel]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dots] button"));
        let index = 0;

        function setSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        dots.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => setSlide(dotIndex));
        });

        if (slides.length > 1) {
            window.setInterval(() => setSlide(index + 1), 5200);
        }
    }

    const filterPanel = document.querySelector("[data-filter-panel]");
    if (filterPanel) {
        const keywordInput = filterPanel.querySelector("[data-filter-keyword]");
        const regionSelect = filterPanel.querySelector("[data-filter-region]");
        const typeSelect = filterPanel.querySelector("[data-filter-type]");
        const yearSelect = filterPanel.querySelector("[data-filter-year]");
        const count = filterPanel.querySelector("[data-filter-count]");
        const cards = Array.from(document.querySelectorAll("[data-card-grid] .movie-card"));
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";

        if (keywordInput && initialQuery) {
            keywordInput.value = initialQuery;
        }

        function applyFilters() {
            const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            const region = regionSelect ? regionSelect.value : "";
            const type = typeSelect ? typeSelect.value : "";
            const year = yearSelect ? yearSelect.value : "";
            let visible = 0;

            cards.forEach((card) => {
                const matchesKeyword = !keyword || (card.dataset.search || "").includes(keyword);
                const matchesRegion = !region || card.dataset.region === region;
                const matchesType = !type || card.dataset.type === type;
                const matchesYear = !year || card.dataset.year === year;
                const show = matchesKeyword && matchesRegion && matchesType && matchesYear;
                card.classList.toggle("is-hidden-by-filter", !show);
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = `${visible} 部`;
            }
        }

        [keywordInput, regionSelect, typeSelect, yearSelect].forEach((control) => {
            if (!control) {
                return;
            }
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        });

        applyFilters();
    }

    const backTop = document.querySelector("[data-back-to-top]");
    if (backTop) {
        window.addEventListener("scroll", () => {
            backTop.classList.toggle("is-visible", window.scrollY > 600);
        }, { passive: true });
        backTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}());
