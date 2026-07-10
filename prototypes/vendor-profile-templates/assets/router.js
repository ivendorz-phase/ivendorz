/* ==========================================================================
   MICROSITE ROUTER — client-side multi-page navigation for a template page.
   ==========================================================================
   The frozen microsite is MULTI-PAGE (Doc-7D §10.2): Home + 6 route pages.
   This mounts a persistent shell (header nav + footer) and swaps the page BODY
   when a nav item (data-page) is clicked — a real page navigation (distinct
   ?page= URL, scroll-to-top, active nav), not an in-page scroll. Presentation
   only; nothing persists. Home is a curated landing that links out.
   ========================================================================== */
(function () {
  window.mountMicrosite = function (opts) {
    const site = document.getElementById("site");
    const C = window.C;
    // shell: header + swappable body + footer + sticky mobile CTA
    site.innerHTML = C.headerNav() + '<div id="pagebody"></div>' + C.footerNav() + C.mobileCta();
    const body = document.getElementById("pagebody");
    const pages = opts.pages; // { id: renderFn }
    const order = opts.order || Object.keys(pages);

    function go(id) {
      if (!pages[id]) id = order[0];
      body.innerHTML = pages[id]();
      site.querySelectorAll("[data-pagetab]").forEach((a) => a.classList.toggle("on", a.getAttribute("data-pagetab") === id));
      // re-apply any section toggles set in the harness panel
      if (window.pcReapplySections) window.pcReapplySections();
      // update deep-link URL without reload
      try {
        const u = new URL(location.href);
        u.searchParams.set("page", id);
        history.replaceState(null, "", u);
      } catch (e) {}
      const stage = document.getElementById("stage");
      if (stage) stage.scrollTop = 0;
      window.scrollTo(0, 0);
      body.classList.remove("page-in");
      void body.offsetWidth; // reflow to restart the transition
      body.classList.add("page-in");
    }
    window.__micrositeGo = go;

    // nav delegation — any [data-page] anywhere in the site navigates
    site.addEventListener("click", (e) => {
      const a = e.target.closest("[data-page]");
      if (!a) return;
      e.preventDefault();
      go(a.getAttribute("data-page"));
    });

    const qs = new URLSearchParams(location.search);
    go(qs.get("page") || opts.home || order[0]);
  };
})();
