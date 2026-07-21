(function () {
  var PORTFOLIO_BASE = 139;
  var ADDON_EACH = 20;
  var MIN_TOTAL = 6;
  var MAX_TOTAL = 100;
  var SUPABASE_URL = "https://yolsngltjtvlxjhiqkcg.supabase.co";
  var SUPABASE_ANON_KEY =
    "sb_publishable_0GcdXT5HzH4JZgDJ7n72Vw_rw4KFrMW";

  var toggleBtn = document.getElementById("beyond-five-toggle");
  var closeBtn = document.getElementById("beyond-five-close");
  var panel = document.getElementById("beyond-five-panel");
  var totalInput = document.getElementById("total-locations");
  var emailInput = document.getElementById("checkout-email");
  var quoteEl = document.getElementById("beyond-five-quote");
  var errorEl = document.getElementById("beyond-five-error");
  var checkoutBtn = document.getElementById("beyond-five-checkout");

  if (!totalInput || !quoteEl || !checkoutBtn || !panel) return;

  function quote(total) {
    var extra = total - 5;
    return {
      extra: extra,
      extraMonthly: extra * ADDON_EACH,
      monthlyTotal: PORTFOLIO_BASE + extra * ADDON_EACH,
    };
  }

  function setPanelOpen(open) {
    panel.hidden = !open;
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
      toggleBtn.textContent = open ? "Hide configuration" : "Configure your plan";
    }
    if (open) {
      window.setTimeout(function () {
        totalInput.focus();
      }, 50);
    }
  }

  function setError(message) {
    if (!errorEl) return;
    if (!message) {
      errorEl.hidden = true;
      errorEl.textContent = "";
      return;
    }
    errorEl.hidden = false;
    errorEl.textContent = message;
  }

  function refreshQuote() {
    setError("");
    var raw = totalInput.value.trim();
    if (!raw) {
      quoteEl.hidden = true;
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Continue to checkout";
      return;
    }

    var total = parseInt(raw, 10);
    if (!Number.isFinite(total) || String(total) !== raw) {
      quoteEl.hidden = false;
      quoteEl.textContent = "Enter a whole number.";
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Continue to checkout";
      return;
    }

    if (total <= 5) {
      quoteEl.hidden = false;
      quoteEl.innerHTML =
        "For 1–5 locations, use a plan card above.";
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Continue to checkout";
      return;
    }

    if (total > MAX_TOTAL) {
      quoteEl.hidden = false;
      quoteEl.innerHTML =
        "For 100+ locations, email <a href=\"mailto:support@permitarc.com\">support@permitarc.com</a>.";
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Continue to checkout";
      return;
    }

    var q = quote(total);
    quoteEl.hidden = false;
    quoteEl.innerHTML =
      "<strong>" +
      total +
      " locations</strong> · <strong>$" +
      q.monthlyTotal +
      "/mo</strong> ($" +
      PORTFOLIO_BASE +
      " + " +
      q.extra +
      " × $" +
      ADDON_EACH +
      ")";
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = "Continue to checkout — $" + q.monthlyTotal + "/mo";
  }

  async function startCheckout() {
    setError("");
    var total = parseInt(totalInput.value.trim(), 10);
    if (!Number.isFinite(total) || total < MIN_TOTAL || total > MAX_TOTAL) {
      setError("Enter a total from 6 to " + MAX_TOTAL + ".");
      return;
    }

    var email = emailInput ? emailInput.value.trim() : "";
    if (!email) {
      setError("Enter the same email you use in the PermitArc app.");
      return;
    }

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "Opening checkout…";

    try {
      var res = await fetch(
        SUPABASE_URL + "/functions/v1/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + SUPABASE_ANON_KEY,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            totalLocations: total,
            customerEmail: email,
          }),
        },
      );

      var data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(
          data.error ||
            "Could not start checkout. Try again or email support@permitarc.com.",
        );
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || String(err));
      refreshQuote();
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      setPanelOpen(panel.hidden);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      setPanelOpen(false);
    });
  }

  if (window.location.hash === "#beyond-five") {
    setPanelOpen(true);
  }

  totalInput.addEventListener("input", refreshQuote);
  if (emailInput) emailInput.addEventListener("input", setError.bind(null, ""));
  checkoutBtn.addEventListener("click", startCheckout);
  refreshQuote();
})();
