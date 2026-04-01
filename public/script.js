(function () {
  "use strict";

  // ─── Theme ───
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  applyTheme(
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  );

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function (e) {
      applyTheme(e.matches ? "dark" : "light");
    });

  // ─── Currency mask ───
  function parseCurrency(str) {
    if (!str) return 0;
    var cleaned = str.replace(/[^\d,]/g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  }

  function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function applyCurrencyMask(input) {
    input.addEventListener("input", function () {
      var raw = input.value.replace(/\D/g, "");
      if (!raw) {
        input.value = "";
        return;
      }
      var num = parseInt(raw, 10) / 100;
      input.value = formatCurrency(num);
    });
  }

  function applyPercentMask(input) {
    input.addEventListener("input", function () {
      var raw = input.value.replace(/[^\d,\.]/g, "");
      input.value = raw;
    });
  }

  var totalInput = document.getElementById("totalInput");
  var taxInput = document.getElementById("taxInput");
  var notePercInput = document.getElementById("notePercInput");

  applyCurrencyMask(totalInput);
  applyCurrencyMask(taxInput);
  applyPercentMask(notePercInput);

  // ─── Validation ───
  function validate() {
    var valid = true;
    var totalVal = parseCurrency(totalInput.value);
    var taxVal = parseCurrency(taxInput.value);
    var notePercVal = notePercInput.value.replace(",", ".");
    notePercVal = notePercVal ? parseFloat(notePercVal) : null;

    var totalError = document.getElementById("totalError");
    var taxError = document.getElementById("taxError");
    var notePercError = document.getElementById("notePercError");

    // Reset
    totalInput.classList.remove("invalid");
    taxInput.classList.remove("invalid");
    notePercInput.classList.remove("invalid");
    totalError.textContent = "";
    taxError.textContent = "";
    notePercError.textContent = "";

    if (!totalInput.value || totalVal <= 0) {
      totalInput.classList.add("invalid");
      totalError.textContent = "Informe o valor total pago.";
      valid = false;
    }

    if (!taxInput.value || taxVal <= 0) {
      taxInput.classList.add("invalid");
      taxError.textContent = "Informe o valor dos impostos.";
      valid = false;
    }

    if (valid && taxVal >= totalVal) {
      taxInput.classList.add("invalid");
      taxError.textContent = "O imposto deve ser menor que o valor total.";
      valid = false;
    }

    if (notePercVal !== null && (notePercVal < 0 || notePercVal > 100)) {
      notePercInput.classList.add("invalid");
      notePercError.textContent = "Informe um percentual entre 0 e 100.";
      valid = false;
    }

    return valid
      ? { total: totalVal, tax: taxVal, notePerc: notePercVal }
      : null;
  }

  // ─── Animate count ───
  function animateCount(el, target, prefix, suffix, duration) {
    prefix = prefix || "";
    suffix = suffix || "";
    duration = duration || 800;
    var start = 0;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current =
        start + (target - eased * (start - target) + eased * target - start);
      current = eased * target;

      if (prefix === "R$ ") {
        el.textContent = prefix + formatCurrency(current);
      } else {
        el.textContent = prefix + current.toFixed(1).replace(".", ",") + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (prefix === "R$ ") {
          el.textContent = prefix + formatCurrency(target);
        } else {
          el.textContent =
            prefix + target.toFixed(1).replace(".", ",") + suffix;
        }
      }
    }

    requestAnimationFrame(step);
  }

  // ─── Calculate ───
  var resultsEl = document.getElementById("results");
  var lastResult = null;

  function calculate(data) {
    var realValue = data.total - data.tax;
    var realPerc = (data.tax / realValue) * 100;
    var notePerc =
      data.notePerc !== null ? data.notePerc : (data.tax / data.total) * 100;

    lastResult = {
      total: data.total,
      tax: data.tax,
      realValue: realValue,
      realPerc: realPerc,
      notePerc: notePerc,
    };

    // Show results
    resultsEl.style.display = "block";
    resultsEl.offsetHeight; // force reflow so CSS transition fires
    resultsEl.classList.add("visible");

    // Animate numbers
    var realValueEl = document.getElementById("realValue");
    var notePercResultEl = document.getElementById("notePercResult");
    var realPercResultEl = document.getElementById("realPercResult");
    var realPercHeroEl = document.getElementById("realPercHero");

    animateCount(realValueEl, realValue, "R$ ", "", 900);
    animateCount(notePercResultEl, notePerc, "", "%", 700);
    animateCount(realPercResultEl, realPerc, "", "%", 1000);
    animateCount(realPercHeroEl, realPerc, "", "%", 1000);

    // Animate bars
    var barMax = Math.max(realPerc, 100);
    var barNota = document.getElementById("barNota");
    var barReal = document.getElementById("barReal");

    // Reset bars
    barNota.style.width = "0";
    barReal.style.width = "0";

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        barNota.style.width = Math.min((notePerc / barMax) * 100, 100) + "%";
        barReal.style.width = Math.min((realPerc / barMax) * 100, 100) + "%";
      });
    });

    // Update URL
    updateURL(data.total, data.tax);

    // Scroll to results
    setTimeout(function () {
      resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  // ─── Form submit ───
  document.getElementById("taxForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var data = validate();
    if (data) calculate(data);
  });

  // ─── URL params ───
  function updateURL(total, tax) {
    var params = new URLSearchParams();
    params.set("total", total.toString());
    params.set("tax", tax.toString());
    var newURL = window.location.pathname + "?" + params.toString();
    history.replaceState(null, "", newURL);
  }

  function loadFromURL() {
    var params = new URLSearchParams(window.location.search);
    var total = parseFloat(params.get("total"));
    var tax = parseFloat(params.get("tax"));

    if (total > 0 && tax > 0 && tax < total) {
      totalInput.value = formatCurrency(total);
      taxInput.value = formatCurrency(tax);

      setTimeout(function () {
        calculate({ total: total, tax: tax, notePerc: null });
      }, 300);
    }
  }

  loadFromURL();

  // ─── Toast ───
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  // ─── Copy link ───
  document.getElementById("copyLinkBtn").addEventListener("click", function () {
    if (!lastResult) return;
    var url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(function () {
        showToast("Link copiado!");
      })
      .catch(function () {
        showToast("Não foi possível copiar.");
      });
  });
})();
