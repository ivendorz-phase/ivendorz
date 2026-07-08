/* ==========================================================================
   ICON SPRITE — inline lucide-convention <symbol>s (stroke 1.75, 24×24).
   Zero external requests. Use `ivIcon('name','extra classes')` in markup,
   or place <svg class="ic"><use href="#i-name"/></svg> directly.
   ========================================================================== */
(function () {
  // Each entry is the inner markup of a 0 0 24 24 icon (stroke-based).
  const P = {
    "shield-check": '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
    "badge-check": '<path d="M12 3l2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.9 2.6.9 2.6-2.3 1.4-1 2.5-2.7-.2L12 21l-2.2-1.6-2.7.2-1-2.5-2.3-1.4.9-2.6-.9-2.6 2.3-1.4 1-2.5 2.7.2z"/><path d="M9 12l2 2 4-4"/>',
    "file-check": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 15l2 2 4-4"/>',
    "file-text": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6M9 9h1"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    "package-check": '<path d="M11 21l-7-4V7l8-4 8 4v5"/><path d="M4 7l8 4 8-4M12 11v10"/><path d="M15 19l2 2 4-4"/>',
    factory: '<path d="M3 21V10l6 4V10l6 4V7l6-4v18z"/><path d="M7 21v-4M12 21v-4M17 21v-4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>',
    package: '<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
    hammer: '<path d="M14 6l4 4M18 10l-8 8-4-4 8-8z"/><path d="M14 6l3-3 4 4-3 3z"/>',
    wrench: '<path d="M15 6a4 4 0 0 1 5 5l-8 8-3-3 8-8a4 4 0 0 1-2-2z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M16 8l-2.5 5.5L8 16l2.5-5.5z"/>',
    gauge: '<path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 15l4-4"/>',
    "hard-hat": '<path d="M4 15a8 8 0 0 1 16 0"/><path d="M10 6a2 2 0 0 1 4 0v4M3 18h18v1H3z"/>',
    zap: '<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
    flame: '<path d="M12 2c1 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5-1-8z"/>',
    droplets: '<path d="M12 3s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10z"/>',
    shirt: '<path d="M6 4l3-1 3 2 3-2 3 1 2 4-3 2v9H7v-9L4 8z"/>',
    "building-2": '<path d="M4 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M12 9h6a1 1 0 0 1 1 1v11M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/><path d="M2 21h20"/>',
    utensils: '<path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M16 3c-1.5 0-2.5 2-2.5 4.5S15 12 16 12v9"/>',
    pill: '<rect x="4" y="8" width="16" height="8" rx="4" transform="rotate(45 12 12)"/><path d="M9 9l6 6"/>',
    anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v13M5 13a7 7 0 0 0 14 0M4 13h2M18 13h2"/>',
    award: '<circle cx="12" cy="9" r="5"/><path d="M9 13l-1 8 4-2 4 2-1-8"/>',
    leaf: '<path d="M4 20C4 10 12 4 20 4c0 8-6 16-16 16z"/><path d="M4 20c4-6 8-8 12-9"/>',
    stamp: '<path d="M9 3a3 3 0 0 1 6 0c0 2-1 3-1 5h-4c0-2-1-3-1-5z"/><path d="M5 13h14v3H5zM4 20h16"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 11v6"/>',
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v6h4v-6h3l1-4h-4V8a1 1 0 0 1 1-1z"/>',
    youtube: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    "check-circle": '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/>',
    "chevron-right": '<path d="M9 6l6 6-6 6"/>',
    "chevron-left": '<path d="M15 6l-6 6 6 6"/>',
    "chevron-down": '<path d="M6 9l6 6 6-6"/>',
    "arrow-right": '<path d="M4 12h16M14 6l6 6-6 6"/>',
    "arrow-left": '<path d="M20 12H4M10 6l-6 6 6 6"/>',
    "arrow-up-right": '<path d="M7 17L17 7M8 7h9v9"/>',
    phone: '<path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    "map-pin": '<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    download: '<path d="M12 3v12M7 11l5 5 5-5M4 20h16"/>',
    "external-link": '<path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
    globe2: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
    star: '<path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L12 17l-5.6 3 1.4-6.2L3 9.5l6.4-.6z"/>',
    quote: '<path d="M7 7H4v6h3l-1 4M17 7h-3v6h3l-1 4"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    tablet: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M12 17h.01"/>',
    smartphone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M12 18h.01"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    moon: '<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/>',
    "layout-grid": '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    sliders: '<path d="M4 21v-6M4 11V3M12 21v-8M12 9V3M20 21v-4M20 13V3M1 15h6M9 9h6M17 17h6"/>',
    send: '<path d="M21 3L3 10l7 3 3 7z"/><path d="M21 3l-8 10"/>',
    building: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5-8 8"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    "circle-dot": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5M3 17l9 5 9-5" stroke-opacity="0.5"/>',
    "trending-up": '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    "message-square": '<path d="M4 5h16v11H9l-5 4z"/>',
  };

  let markup = '<svg width="0" height="0" style="position:absolute" aria-hidden="true">';
  for (const name in P) {
    markup +=
      `<symbol id="i-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">` +
      P[name] +
      "</symbol>";
  }
  markup += "</svg>";

  function inject() {
    if (document.getElementById("iv-icon-sprite")) return;
    const div = document.createElement("div");
    div.id = "iv-icon-sprite";
    div.innerHTML = markup;
    document.body.insertBefore(div.firstChild, document.body.firstChild);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject);
  else inject();

  window.ivIcon = function (name, cls) {
    return `<svg class="ic ${cls || ""}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  };
})();
