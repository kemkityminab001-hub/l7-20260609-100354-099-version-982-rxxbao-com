(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = "search.html";
        }
      });
    });
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function initFilters() {
    var panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach(function (panel) {
      var scope = document.querySelector(panel.getAttribute("data-target") || "[data-filter-grid]");
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .compact-card"));
      var keywordInput = panel.querySelector("[data-filter-keyword]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var categorySelect = panel.querySelector("[data-filter-category]");
      var resetButton = panel.querySelector("[data-filter-reset]");
      var empty = document.querySelector(panel.getAttribute("data-empty") || "");

      if (keywordInput && keywordInput.hasAttribute("data-use-query")) {
        keywordInput.value = readQuery();
      }

      function apply() {
        var keyword = normalize(keywordInput ? keywordInput.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var category = normalize(categorySelect ? categorySelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-category"),
            card.getAttribute("data-genre")
          ].join(" "));
          var ok = true;
          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (region && normalize(card.getAttribute("data-region")) !== region) {
            ok = false;
          }
          if (year && normalize(card.getAttribute("data-year")) !== year) {
            ok = false;
          }
          if (category && normalize(card.getAttribute("data-category")) !== category) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [keywordInput, regionSelect, yearSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (resetButton) {
        resetButton.addEventListener("click", function () {
          if (keywordInput) {
            keywordInput.value = "";
          }
          if (regionSelect) {
            regionSelect.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          if (categorySelect) {
            categorySelect.value = "";
          }
          apply();
        });
      }

      apply();
    });
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initFilters();
  });
})();
