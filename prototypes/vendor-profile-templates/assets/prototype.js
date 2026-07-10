/* ==========================================================================
   PROTOTYPE HARNESS (chrome, `pc-` prefix) — shared by all 5 layout pages.
   Injects the review toolbar (device · theme · section config · back-to-hub),
   wires mock CTAs to toasts, and runs the gallery lightbox. NON-PRODUCTION.
   Every "action" fires a toast that names the concept; NOTHING persists.
   ========================================================================== */
(function () {
  const qs = new URLSearchParams(location.search);

  const DEVICES = [
    { id: "desktop", label: "Desktop", icon: "monitor", w: 0 },
    { id: "tablet", label: "Tablet", icon: "tablet", w: 834 },
    { id: "mobile", label: "Mobile", icon: "smartphone", w: 390 },
  ];

  window.initPrototype = function (opts) {
    opts = opts || {};
    const stage = document.getElementById("stage");
    if (!stage) return;

    // --- Toolbar -----------------------------------------------------------
    const bar = document.createElement("header");
    bar.className = "pc-toolbar";
    bar.innerHTML = `
      <a class="pc-home" href="index.html" title="Back to template hub">
        ${ivIcon("layout-grid")}<span>Templates</span>
      </a>
      <div class="pc-title">
        <strong>${opts.name || "Vendor Profile"}</strong>
        <span class="pc-tag">${opts.tag || ""}</span>
      </div>
      <div class="pc-spacer"></div>
      <div class="pc-seg" id="pc-device" role="group" aria-label="Device preview">
        ${DEVICES.map(
          (d, i) =>
            `<button class="pc-seg-btn${i === 0 ? " on" : ""}" data-device="${d.id}" title="${d.label}">${ivIcon(d.icon)}<span>${d.label}</span></button>`,
        ).join("")}
      </div>
      <button class="pc-btn" id="pc-theme" aria-pressed="false" title="Toggle light / dark">
        ${ivIcon("moon")}<span>Dark</span>
      </button>
      <button class="pc-btn" id="pc-sections" title="Configure sections">
        ${ivIcon("sliders")}<span>Sections</span>
      </button>`;
    document.body.insertBefore(bar, document.body.firstChild);

    // --- Section config panel ---------------------------------------------
    const panel = document.createElement("div");
    panel.className = "pc-panel";
    panel.id = "pc-panel";
    panel.hidden = true;
    panel.innerHTML = `
      <div class="pc-panel-head">
        <strong>Configure sections</strong>
        <button class="pc-x" id="pc-panel-x" aria-label="Close">${ivIcon("x")}</button>
      </div>
      <p class="pc-panel-note">Sections are configurable per vendor — enable, disable or the template ignores them. All 5 templates read the <em>same</em> data &amp; section registry (Content&nbsp;≠&nbsp;Presentation).</p>
      <div class="pc-panel-list" id="pc-panel-list"></div>`;
    document.body.appendChild(panel);

    // Disabled-section set persists across page navigations (multi-page shell);
    // the router calls window.pcReapplySections() after every page render so a
    // toggle stays honoured on whichever page the section next appears.
    const disabled = new Set();
    const list = panel.querySelector("#pc-panel-list");
    (window.IV_SECTIONS || []).forEach((s) => {
      const row = document.createElement("label");
      row.className = "pc-panel-row";
      row.innerHTML = `<span>${s.label}</span><input type="checkbox" data-toggle="${s.id}" ${s.enabled ? "checked" : ""}>`;
      list.appendChild(row);
      if (!s.enabled) disabled.add(s.id);
    });
    list.addEventListener("change", (e) => {
      const id = e.target.getAttribute("data-toggle");
      if (!id) return;
      if (e.target.checked) disabled.delete(id);
      else disabled.add(id);
      reapply();
    });
    function reapply() {
      stage.querySelectorAll("[data-section]").forEach((el) => {
        el.style.display = disabled.has(el.getAttribute("data-section")) ? "none" : "";
      });
      stage.querySelectorAll("[data-navfor]").forEach((el) => {
        el.style.display = disabled.has(el.getAttribute("data-navfor")) ? "none" : "";
      });
    }
    window.pcReapplySections = reapply;
    reapply();

    // --- Device switch -----------------------------------------------------
    bar.querySelectorAll("[data-device]").forEach((b) => {
      b.addEventListener("click", () => {
        bar.querySelectorAll("[data-device]").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        setDevice(b.getAttribute("data-device"));
      });
    });
    function setDevice(id) {
      const d = DEVICES.find((x) => x.id === id) || DEVICES[0];
      stage.classList.toggle("is-mobile", id === "mobile");
      stage.classList.toggle("is-tablet", id === "tablet");
      if (d.w) {
        stage.style.maxWidth = d.w + "px";
        stage.classList.add("pc-device");
      } else {
        stage.style.maxWidth = "";
        stage.classList.remove("pc-device");
      }
      stage.scrollTop = 0;
      window.scrollTo(0, 0);
    }

    // --- Theme toggle ------------------------------------------------------
    const themeBtn = bar.querySelector("#pc-theme");
    function setTheme(dark) {
      stage.classList.toggle("iv-theme-dark", dark);
      themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
      themeBtn.querySelector("span").textContent = dark ? "Light" : "Dark";
      themeBtn.querySelector("use").setAttribute("href", dark ? "#i-sun" : "#i-moon");
    }
    themeBtn.addEventListener("click", () => setTheme(!stage.classList.contains("iv-theme-dark")));

    // --- Sections panel open/close ----------------------------------------
    bar.querySelector("#pc-sections").addEventListener("click", () => (panel.hidden = !panel.hidden));
    panel.querySelector("#pc-panel-x").addEventListener("click", () => (panel.hidden = true));

    // --- Deep-link presets -------------------------------------------------
    if (qs.get("device")) {
      const btn = bar.querySelector(`[data-device="${qs.get("device")}"]`);
      if (btn) btn.click();
    }
    if (qs.get("theme") === "dark") setTheme(true);

    wireMockActions(stage);
    wireLightbox(stage);
    wireLocalNav(stage);
    startClientMarquee(stage);
    startHeroCarousels(stage);
  };

  // --- Hero carousel (auto-slide image slides + text) ----------------------
  function setHero(h, i) {
    const slides = h.querySelectorAll(".hero-slide");
    const n = slides.length;
    if (!n) return;
    i = ((i % n) + n) % n;
    h.dataset.i = i;
    const track = h.querySelector(".hero-track");
    if (track) track.style.transform = "translateX(-" + i * 100 + "%)";
    h.querySelectorAll("[data-hero-dot]").forEach((d, di) => d.classList.toggle("on", di === i));
  }
  function startHeroCarousels(stage) {
    if (!stage.__hero) {
      stage.__hero = true;
      stage.addEventListener("click", (e) => {
        const dot = e.target.closest("[data-hero-dot]");
        const arrow = e.target.closest("[data-hero-arrow]");
        if (dot) { const h = dot.closest("[data-hero]"); setHero(h, +dot.getAttribute("data-hero-dot")); h.dataset.touched = "1"; }
        else if (arrow) { const h = arrow.closest("[data-hero]"); setHero(h, (+(h.dataset.i || 0)) + +arrow.getAttribute("data-hero-arrow")); h.dataset.touched = "1"; }
      });
      stage.addEventListener("mouseover", (e) => { const h = e.target.closest("[data-hero]"); if (h) h.dataset.paused = "1"; });
      stage.addEventListener("mouseout", (e) => { const h = e.target.closest("[data-hero]"); if (h) delete h.dataset.paused; });
    }
    if (!window.__heroTimer) {
      // single global auto-advance — picks up any hero rendered on the current page
      window.__heroTimer = setInterval(() => {
        document.querySelectorAll("[data-hero]").forEach((h) => {
          if (h.dataset.paused) return;
          setHero(h, (+(h.dataset.i || 0)) + 1);
        });
      }, 5200);
    }
  }

  // --- Clients auto-slide (JS-driven continuous marquee) -------------------
  let marqueeRunning = false;
  function trackOf(el) {
    const m = el && el.closest ? el.closest(".client-marquee") : null;
    return m ? m.querySelector(".client-track") : null;
  }
  function startClientMarquee(stage) {
    // hover pauses the track under the cursor (delegated, once per stage)
    if (!stage.__mq) {
      stage.__mq = true;
      stage.addEventListener("mouseover", (e) => { const t = trackOf(e.target); if (t) t.dataset.paused = "1"; });
      stage.addEventListener("mouseout", (e) => { const t = trackOf(e.target); if (t) delete t.dataset.paused; });
    }
    if (marqueeRunning) return; // single global loop drives all tracks
    marqueeRunning = true;
    const SPEED = 0.45; // px per frame — gentle "slow slide"
    function frame() {
      document.querySelectorAll(".client-track").forEach((tr) => {
        tr.setAttribute("data-js", ""); // disable the CSS fallback animation
        if (tr.dataset.paused) return;
        const gap = parseFloat(getComputedStyle(tr).columnGap || getComputedStyle(tr).gap || "14") || 14;
        const period = (tr.scrollWidth + gap) / 2; // width of ONE duplicated set (seamless loop)
        let x = parseFloat(tr.dataset.x || "0") - SPEED;
        if (period > 0 && -x >= period) x += period;
        tr.dataset.x = x;
        tr.style.transform = "translateX(" + x + "px)";
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // --- Mock CTA toasts -----------------------------------------------------
  function wireMockActions(stage) {
    stage.addEventListener("click", (e) => {
      const el = e.target.closest("[data-cta]");
      if (!el) return;
      e.preventDefault();
      toast(el.getAttribute("data-cta"));
    });
  }
  let rack;
  function toast(msg) {
    if (!rack) {
      rack = document.createElement("div");
      rack.className = "pc-toasts";
      rack.setAttribute("aria-live", "polite");
      document.body.appendChild(rack);
    }
    const t = document.createElement("div");
    t.className = "pc-toast";
    t.innerHTML = `${ivIcon("circle-dot")}<span>${msg}</span>`;
    rack.appendChild(t);
    while (rack.children.length > 3) rack.removeChild(rack.firstChild);
    setTimeout(() => {
      t.classList.add("out");
      setTimeout(() => t.remove(), 300);
    }, 3400);
  }
  window.pcToast = toast;

  // --- Gallery lightbox ----------------------------------------------------
  function wireLightbox(stage) {
    let box;
    stage.addEventListener("click", (e) => {
      const img = e.target.closest("[data-lightbox]");
      if (!img) return;
      const src = img.getAttribute("src") || img.getAttribute("data-src");
      if (!box) {
        box = document.createElement("div");
        box.className = "pc-lightbox";
        box.innerHTML = `<button class="pc-lb-x" aria-label="Close">${ivIcon("x")}</button><img alt="">`;
        document.body.appendChild(box);
        box.addEventListener("click", (ev) => {
          if (ev.target === box || ev.target.closest(".pc-lb-x")) box.classList.remove("on");
        });
        document.addEventListener("keydown", (ev) => {
          if (ev.key === "Escape") box.classList.remove("on");
        });
      }
      box.querySelector("img").src = src;
      box.classList.add("on");
    });
  }

  // --- In-page smooth nav (tab / anchor chips) -----------------------------
  function wireLocalNav(stage) {
    stage.addEventListener("click", (e) => {
      const link = e.target.closest("[data-scroll]");
      if (!link) return;
      e.preventDefault();
      const target = stage.querySelector(link.getAttribute("data-scroll"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      // active state on sibling nav chips
      const nav = link.closest("[data-nav]");
      if (nav) {
        nav.querySelectorAll("[data-scroll]").forEach((x) => x.classList.remove("on"));
        link.classList.add("on");
      }
    });
  }
})();
