/* ==========================================================================
   SHARED COMPONENT BUILDERS (`C.*`) — every layout composes THESE.
   ==========================================================================
   Same builders + same data (IV_VENDOR) across all 5 templates → identical
   components, different arrangement. This is the Content ≠ Presentation proof:
   a section's DATA lives once; a template only decides WHICH sections, in WHAT
   order, with WHAT emphasis. Each section is wrapped with data-section="<id>"
   so the harness section-config panel can enable / disable / (conceptually)
   reorder it without touching the template.
   ========================================================================== */
(function () {
  const V = window.IV_VENDOR;
  const I = window.ivIcon;

  // section wrapper — carries the toggle hook
  function sec(id, inner, cls) {
    return `<section class="section ${cls || ""}" data-section="${id}"><div class="wrap">${inner}</div></section>`;
  }
  function head(eyebrow, title, sub, center) {
    return `<div class="section-head ${center ? "center" : ""}">
      ${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ""}
      <h2 class="section-title">${title}</h2>
      ${sub ? `<p class="section-sub">${sub}</p>` : ""}
    </div>`;
  }
  const capMeta = {
    can_supply: { c: "cap-supply", i: "package", t: "Supply" },
    can_service: { c: "cap-service", i: "wrench", t: "Service" },
    can_fabricate: { c: "cap-fabricate", i: "hammer", t: "Fabricate" },
    can_consult: { c: "cap-consult", i: "compass", t: "Consult" },
  };

  const C = {
    /* -------- brand / chrome -------- */
    verified() {
      return V.verified ? `<span class="verified-badge">${I("shield-check")} Verified Vendor</span>` : "";
    },
    capMatrix() {
      return `<div class="cap-matrix">${Object.keys(V.capability)
        .filter((k) => V.capability[k])
        .map((k) => `<span class="cap-chip ${capMeta[k].c}">${I(capMeta[k].i)} ${capMeta[k].t}</span>`)
        .join("")}</div>`;
    },
    trustWidget() {
      const t = V.trust;
      return `<div class="trust-widget" data-section="trust">
        <div class="trust-ring" style="--v:${t.score}"><span class="num">${t.score}</span></div>
        <div style="flex:1">
          <div class="trust-band">${t.band} Trust</div>
          <div class="trust-meta">Updated ${t.updated} · 0–100 scale</div>
          <div class="trust-pillars">${t.pillars.map((p) => `<div class="trust-pillar">${p.label} <b>${p.value}</b></div>`).join("")}</div>
        </div>
      </div>`;
    },
    header(tabs) {
      const items = tabs || [
        ["about", "About"],
        ["capabilities", "Capabilities"],
        ["products", "Products"],
        ["projects", "Projects"],
        ["certifications", "Certifications"],
        ["contact", "Contact"],
      ];
      return `<header class="site-header"><div class="wrap">
        <div class="brand"><img class="brand-logo" src="${V.logo}" alt="${V.name} logo">
          <div><div class="brand-name">${V.name.replace(" Ltd.", "")}</div><div class="brand-sub">Narayanganj · Bangladesh</div></div>
        </div>
        <nav class="nav-tabs" data-nav>${items
          .map((t, i) => `<a class="nav-tab ${i === 0 ? "on" : ""}" data-scroll="[data-section='${t[0]}']" data-navfor="${t[0]}">${t[1]}</a>`)
          .join("")}</nav>
        <div class="header-cta">
          <a class="btn btn-outline btn-sm" data-cta="Company profile PDF — mock download (nothing persists).">${I("download")}<span>Profile</span></a>
          <a class="btn btn-primary btn-sm" data-cta="Request quote → routes to sign-in (RFQ engine M3). Anonymous intent, no money on-platform.">${I("send")}<span>Request quote</span></a>
        </div>
      </div></header>`;
    },

    /* -------- hero variants -------- */
    hero(variant) {
      if (variant === "landing") {
        return `<section class="hero"><div class="hero-cover"><img src="${V.coverBanner}" alt=""><div class="hero-overlay"></div></div>
          <div class="wrap" style="text-align:center;margin-top:-52px;position:relative">
            <img class="hero-logo" style="margin:0 auto" src="${V.logo}" alt="">
            <h1 style="font-size:clamp(22px,5cqw,30px);margin-top:16px">${V.name}</h1>
            <p style="color:var(--iv-fg-secondary);margin-top:10px;line-height:1.55">${V.tagline}</p>
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px">${C.verified()}${C.capMatrix()}</div>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:18px">
              <a class="btn btn-primary" data-cta="Request quote → sign-in (M3).">${I("send")} Request quote</a>
              <a class="btn btn-outline" data-cta="Call — mock.">${I("phone")} Call</a>
            </div>
          </div></section>`;
      }
      // Carousel hero (classic · modern · catalogue): auto-sliding image slides,
      // each carrying its own text, inside a minimally-bordered frame. Slide motion
      // is driven by prototype.js (auto-advance + dots + arrows, pause on hover).
      const quote = "Request quote → routes to sign-in (RFQ engine M3). Anonymous intent, no money on-platform.";
      const slides = V.heroSlides
        .map(
          (s) => `<div class="hero-slide"><img src="${s.img}" alt=""><div class="hero-slide-overlay"></div>
            <div class="wrap"><div class="hero-slide-content">
              <span class="hero-eyebrow">${s.eyebrow}</span>
              <h1 class="hero-title">${s.title}</h1>
              <p class="hero-tagline">${s.text}</p>
              <div class="hero-actions">
                <a class="btn btn-gold btn-lg" data-cta="${quote}">${I("send")} ${s.cta}</a>
                <a class="btn btn-white btn-lg" data-cta="Company profile PDF — mock download (nothing persists).">${I("download")} Company profile</a>
              </div>
            </div></div></div>`,
        )
        .join("");
      const dots = V.heroSlides.map((s, i) => `<button class="hero-dot ${i === 0 ? "on" : ""}" data-hero-dot="${i}" aria-label="Go to slide ${i + 1}"></button>`).join("");
      const extra =
        variant === "catalogue"
          ? `<span class="badge badge-navy">${I("layers", "ic-sm")} ${V.products.length}+ SKUs listed</span>`
          : `<span class="badge badge-navy">Est. ${V.established}</span>`;
      return `<section class="hero hero-${variant}"><div class="wrap hero-wrap">
        <div class="hero-carousel" data-hero data-i="0">
          <div class="hero-track">${slides}</div>
          <button class="hero-arrow prev" data-hero-arrow="-1" aria-label="Previous slide">${I("chevron-left")}</button>
          <button class="hero-arrow next" data-hero-arrow="1" aria-label="Next slide">${I("chevron-right")}</button>
          <div class="hero-dots">${dots}</div>
        </div>
        <div class="hero-brandbar">
          <img class="hero-logo" src="${V.logo}" alt="">
          <div style="flex:1;min-width:220px">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span class="brand-name" style="font-size:18px">${V.name.replace(" Ltd.", "")}</span>${C.verified()}${extra}
            </div>
            <div style="margin-top:10px">${C.capMatrix()}</div>
          </div>
        </div>
      </div></section>`;
    },

    /* -------- content sections -------- */
    stats(alt) {
      return sec(
        "about",
        `<div class="stat-row">${V.stats.map((s) => `<div class="stat-tile">${I(s.icon, "ic-lg")}<div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join("")}</div>`,
        "section-tight " + (alt ? "section-alt" : ""),
      );
    },
    about(withImage) {
      const body = V.aboutCompany.map((p) => `<p style="margin-bottom:14px">${p}</p>`).join("");
      const inner = withImage
        ? `${head("Who we are", "About the company", V.businessSummary)}
           <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:32px;align-items:start" class="about-split">
             <div style="color:var(--iv-fg-secondary);line-height:1.7;font-size:15px">${body}</div>
             <div class="card card-pad">${C.trustWidget().replace('data-section="trust"', "")}<div style="margin-top:16px">${C.capMatrix()}</div></div>
           </div>`
        : `${head("Who we are", "About the company", V.businessSummary)}
           <div style="color:var(--iv-fg-secondary);line-height:1.7;font-size:15px;max-width:820px">${body}</div>`;
      return sec("about", inner);
    },
    capabilities() {
      return sec(
        "capabilities",
        `${head("What we do", "Capabilities", "A full-lifecycle fluid-control partner — the four-flag capability matrix, sourced from the vendor's own declaration.")}
        <div class="cap-grid">${V.capabilities
          .map((c) => `<div class="cap-card"><div class="cap-icon">${I(c.icon)}</div><h4>${c.title}</h4><p>${c.desc}</p></div>`)
          .join("")}</div>`,
      );
    },
    services(alt) {
      return sec(
        "services",
        `${head("Beyond supply", "Services", "")}
        <div class="service-grid">${V.services
          .map((s) => `<div class="service-card"><div class="cap-icon">${I(s.icon)}</div><div><h4>${s.title}</h4><p>${s.desc}</p></div></div>`)
          .join("")}</div>`,
        alt ? "section-alt" : "",
      );
    },
    productGrid(items, cols) {
      return `<div class="product-grid ${cols === 3 ? "cols-3" : ""}">${(items || V.products)
        .map(
          (p) => `<article class="product-card">
        <div class="product-media"><img src="${p.img}" alt="${p.name}"></div>
        <div class="product-body">
          <div class="product-name">${p.name}</div>
          <div class="product-spec">${p.spec}</div>
          <div class="product-tags">${p.tags.map((t) => `<span class="badge badge-navy">${t}</span>`).join("")}</div>
          <div class="product-meta"><span>MOQ <b>${p.moq}</b></span><span>Lead <b>${p.lead}</b></span></div>
          <a class="btn btn-outline btn-sm btn-block" style="margin-top:2px" data-cta="Inquire about “${p.name}” → sign-in (M3 RFQ). No price shown; no order placed.">${I("message-square", "ic-sm")} Inquire</a>
        </div></article>`,
        )
        .join("")}</div>`;
    },
    productsSimple(alt) {
      return sec(
        "products",
        `${head("Catalogue", "Core products", "A curated, editorial selection — not a ranked list.")}
         <div style="margin-bottom:20px">${C.catNav()}</div>${C.productGrid(V.products.slice(0, 8), 4)}
         <div style="text-align:center;margin-top:26px"><a class="btn btn-outline" data-cta="View full catalogue — mock.">View all ${V.productCategories.reduce((a, c) => a + c.count, 0)} products ${I("arrow-right", "ic-sm")}</a></div>`,
        alt ? "section-alt" : "",
      );
    },
    catNav() {
      return `<div class="cat-nav" data-nav>${V.productCategories
        .map((c, i) => `<button class="cat-pill ${i === 0 ? "on" : ""}" data-cta="Filter “${c.label}” — mock, presentation only.">${c.label} <span class="n">${c.count}</span></button>`)
        .join("")}</div>`;
    },
    industries(alt) {
      return sec(
        "industries",
        `${head("Sectors", "Industries served", "")}
        <div class="industry-grid">${V.industries.map((n) => `<div class="industry-chip">${I(n.icon)} ${n.label}</div>`).join("")}</div>`,
        alt ? "section-alt" : "",
      );
    },
    projects(variant, alt) {
      if (variant === "timeline") {
        return sec(
          "projects",
          `${head("Track record", "Project timeline", "Selected delivered projects — chronological, vendor-declared.")}
          <div class="timeline">${V.projects
            .map(
              (p) => `<div class="timeline-item"><div class="timeline-year">${p.year}</div>
            <h3 style="font-size:17px;margin-top:4px">${p.name}</h3>
            <div class="project-client">${p.client}</div>
            <p class="project-scope">${p.scope}</p></div>`,
            )
            .join("")}</div>`,
          alt ? "section-alt" : "",
        );
      }
      const cards = V.projects
        .map(
          (p) => `<article class="project-card">
        <div class="project-media"><img src="${p.img}" alt="${p.name}"><span class="badge badge-navy sector-tag">${p.sector}</span></div>
        <div class="project-body">
          <div class="project-client">${p.client} · ${p.year}</div>
          <h3 class="project-name">${p.name}</h3>
          <p class="project-scope">${p.scope}</p>
          <div class="project-foot"><span class="project-value">${p.value}</span><a class="btn btn-ghost btn-sm" data-cta="Case study “${p.name}” — mock.">Case study ${I("arrow-right", "ic-sm")}</a></div>
        </div></article>`,
        )
        .join("");
      return sec("projects", `${head("Track record", "Featured projects", "A curated slice of delivered work — never a computed ranking.")}<div class="project-grid">${cards}</div>`, alt ? "section-alt" : "");
    },
    gallery(alt) {
      return sec(
        "gallery",
        `${head("Inside the plant", "Gallery", "")}
        <div class="gallery-grid">${V.gallery.map((g, i) => `<div class="gallery-item"><img src="${g}" data-lightbox alt="Facility photo ${i + 1}"></div>`).join("")}</div>`,
        alt ? "section-alt" : "",
      );
    },
    certifications(alt) {
      return sec(
        "certifications",
        `${head("Compliance", "Certifications & standards", "")}
        <div class="cert-grid">${V.certifications
          .map((c) => `<div class="cert-card"><div class="cert-icon">${I(c.icon)}</div><div class="cert-name">${c.name}</div><div class="cert-body">${c.body} · ${c.year}</div></div>`)
          .join("")}</div>`,
        alt ? "section-alt" : "",
      );
    },
    clients(alt) {
      // Slow, continuous auto-slide carousel — each slide is a client logo + text.
      // The track is duplicated so the loop is seamless; paused on hover; a
      // reduced-motion fallback turns it into a static scrollable row.
      const slide = (c) =>
        `<div class="client-slide"><img src="${c.logo}" alt="${c.name} logo"><div><div class="client-name">${c.name}</div><div class="client-note">${c.note}</div></div></div>`;
      const track = V.clients.map(slide).join("") + V.clients.map(slide).join("");
      return sec(
        "clients",
        `${head("Trusted by", "Clients", "Delivering to Bangladesh's leading industrial buyers.")}
        <div class="client-marquee" role="group" aria-label="Client logos"><div class="client-track">${track}</div></div>`,
        alt ? "section-alt" : "",
      );
    },
    factory(alt) {
      const f = V.factory;
      const rows = [
        ["Facility area", f.area],
        ["Location", f.location],
        ["Production lines", f.lines],
        ["Capacity", f.capacity],
        ["Workforce", f.workforce],
        ["Standards", f.standards],
      ];
      return sec(
        "factory",
        `${head("Manufacturing", "Factory information", "")}
        <div class="factory-grid">
          <div class="factory-media"><img src="${f.img}" data-lightbox alt="Factory"></div>
          <div class="spec-list">${rows.map((r) => `<div class="spec-row"><span class="k">${r[0]}</span><span class="v">${r[1]}</span></div>`).join("")}</div>
        </div>`,
        alt ? "section-alt" : "",
      );
    },
    team(alt) {
      return sec(
        "team",
        `${head("People", "Leadership team", "")}
        <div class="team-grid">${V.team.map((m) => `<div class="team-card"><div class="team-avatar">${m.initials}</div><div class="team-name">${m.name}</div><div class="team-role">${m.role}</div></div>`).join("")}</div>`,
        alt ? "section-alt" : "",
      );
    },
    businessInfo(alt) {
      return sec(
        "business",
        `${head("Company facts", "Business information", "")}
        <div class="card card-pad"><div class="biz-grid">${V.businessInfo.map((b) => `<div class="biz-row"><span class="k">${b.label}</span><span class="v">${b.value}</span></div>`).join("")}</div></div>`,
        alt ? "section-alt" : "",
      );
    },
    contact(alt) {
      const c = V.contact;
      const items = [
        ["map-pin", "Address", c.address],
        ["phone", "Phone", c.phone],
        ["mail", "Email", c.email],
        ["globe", "Website", c.website],
        ["clock", "Business hours", c.hours],
      ];
      return sec(
        "contact",
        `${head("Get in touch", "Contact & location", "")}
        <div class="contact-grid">
          <div class="contact-list">${items
            .map((it) => `<div class="contact-item">${I(it[0])}<div><div class="k">${it[1]}</div><div class="v">${it[2]}</div></div></div>`)
            .join("")}
            <div style="display:flex;gap:8px;padding:12px 15px">${V.social.map((s) => `<a class="btn btn-outline btn-sm" data-cta="${s.label} — mock link.">${I(s.icon, "ic-sm")}</a>`).join("")}</div>
          </div>
          <div class="map"><div class="map-pin">${I("map-pin")}</div><div class="map-card"><b>${V.name.replace(" Ltd.", "")}</b><br>${c.address}</div></div>
        </div>`,
        alt ? "section-alt" : "",
      );
    },
    related(alt) {
      return sec(
        "related",
        `${head("Discover more", "Related vendors", "")}
        <div class="related-grid">${V.related
          .map(
            (r) => `<a class="related-card" data-cta="Open “${r.name}” profile — mock link.">
          <img src="${r.logo}" alt=""><div><div class="related-name">${r.name}</div><div class="related-cat">${r.cat}</div></div>
          ${r.verified ? `<span style="margin-left:auto">${I("badge-check", "ic-sm")}</span>` : ""}</a>`,
          )
          .join("")}</div>`,
        alt ? "section-alt" : "",
      );
    },
    ctaBand() {
      return `<div class="wrap" style="padding-top:20px;padding-bottom:20px"><div class="cta-band">
        <div><h3>Ready to source with confidence?</h3><p>Send a quote request to ${V.name.replace(" Ltd.", "")} — you'll be asked to sign in. No money changes hands on iVendorz.</p></div>
        <div class="cta-actions">
          <a class="btn btn-gold btn-lg" data-cta="Request quote → sign-in (M3 RFQ engine).">${I("send")} Request quote</a>
          <a class="btn btn-white btn-lg" data-cta="Contact — mock.">${I("phone")} Contact</a>
        </div>
      </div></div>`;
    },
    footer() {
      return `<footer class="site-footer"><div class="wrap">
        <div class="footer-grid footer">
          <div>
            <div class="footer-brand"><img src="${V.logo}" alt=""><div class="brand-name">${V.name.replace(" Ltd.", "")}</div></div>
            <p style="font-size:13px;color:#8ba0c6;line-height:1.6;max-width:280px">${V.businessSummary.slice(0, 130)}…</p>
            <div class="footer-social">${V.social.map((s) => `<a data-cta="${s.label} — mock.">${I(s.icon, "ic-sm")}</a>`).join("")}</div>
          </div>
          <div><h5>Company</h5><div class="footer-links"><a data-scroll="[data-section='about']">About</a><a data-scroll="[data-section='capabilities']">Capabilities</a><a data-scroll="[data-section='certifications']">Certifications</a><a data-scroll="[data-section='contact']">Contact</a></div></div>
          <div><h5>Catalogue</h5><div class="footer-links">${V.productCategories.map((c) => `<a data-cta="Category “${c.label}” — mock.">${c.label}</a>`).join("")}</div></div>
          <div><h5>Get a quote</h5><p style="font-size:13px;color:#8ba0c6;line-height:1.6">${V.contact.phone}<br>${V.contact.email}</p><a class="btn btn-gold btn-sm" style="margin-top:12px" data-cta="Request quote → sign-in (M3).">${I("send", "ic-sm")} Request quote</a></div>
        </div>
        <div class="footer-bottom"><span>© ${V.established}–2026 ${V.name} · Member since ${V.memberSince}</span><span>Powered by <b style="color:#fff">iVendorz</b> — Bangladesh's Industrial Procurement OS</span></div>
      </div></footer>`;
    },
    mobileCta() {
      return `<div class="mobile-cta">
        <a class="btn btn-outline btn-block" data-cta="Call — mock.">${I("phone", "ic-sm")} Call</a>
        <a class="btn btn-primary btn-block" data-cta="Request quote → sign-in (M3 RFQ).">${I("send", "ic-sm")} Request quote</a>
      </div>`;
    },
    poweredStrip() {
      return `<div class="powered">Digital showcase powered by <b>iVendorz</b> · Content ≠ Presentation — this profile's data is shared across all 5 templates.</div>`;
    },
  };

  /* ======================================================================
     MULTI-PAGE MICROSITE  (mirrors the frozen canonical 7 — Doc-7D §10.2:
     Home · About · Products · Projects · Industries · Resources · Contact.
     "Resources" is the umbrella for certifications / gallery / downloads —
     NOT separate top-level routes.) Home is a CURATED landing that links out
     via "View all"; each other item is a distinct page with its own ?page= URL.
  ====================================================================== */
  const SHORT = V.name.replace(" Ltd.", "");
  // Owner-directed prototype amendment (2026-07-08): Industries page removed;
  // Resources merged into About. NAV is now 5 items — a DELIBERATE divergence
  // from frozen Doc-7D §10.2 (canonical seven), flagged for a Board additive
  // patch before production implementation. Prototype is non-authoritative.
  C.NAV = [
    ["home", "Home"],
    ["about", "About"],
    ["products", "Products"],
    ["projects", "Projects"],
    ["contact", "Contact"],
  ];

  C.viewAll = function (page, label) {
    return `<div style="margin-top:26px"><a class="btn btn-outline" data-page="${page}">${label} ${I("arrow-right", "ic-sm")}</a></div>`;
  };

  // persistent chrome for the multi-page shell — nav items are ROUTE links (data-page)
  C.headerNav = function () {
    return (
      `<header class="site-header"><div class="wrap">
        <a class="brand" data-page="home"><img class="brand-logo" src="${V.logo}" alt="${V.name} logo">
          <div><div class="brand-name">${SHORT}</div><div class="brand-sub">Narayanganj · Bangladesh</div></div>
        </a>
        <nav class="nav-tabs" data-nav>${C.NAV.map((n, i) => `<a class="nav-tab ${i === 0 ? "on" : ""}" data-page="${n[0]}" data-pagetab="${n[0]}">${n[1]}</a>`).join("")}</nav>
        <div class="header-cta">
          <a class="btn btn-outline btn-sm" data-cta="Company profile PDF — mock download (nothing persists).">${I("download")}<span>Profile</span></a>
          <a class="btn btn-primary btn-sm" data-cta="Request quote → routes to sign-in (RFQ engine M3). Anonymous intent, no money on-platform.">${I("send")}<span>Request quote</span></a>
        </div>
      </div></header>` +
      `<nav class="mobile-pagenav" data-nav aria-label="Vendor sections">${C.NAV.map((n, i) => `<a class="mnav ${i === 0 ? "on" : ""}" data-page="${n[0]}" data-pagetab="${n[0]}">${n[1]}</a>`).join("")}</nav>`
    );
  };
  C.footerNav = function () {
    return `<footer class="site-footer"><div class="wrap">
      <div class="footer-grid footer">
        <div>
          <div class="footer-brand"><img src="${V.logo}" alt=""><div class="brand-name">${SHORT}</div></div>
          <p style="font-size:13px;color:#8ba0c6;line-height:1.6;max-width:280px">${V.businessSummary.slice(0, 130)}…</p>
          <div class="footer-social">${V.social.map((s) => `<a data-cta="${s.label} — mock.">${I(s.icon, "ic-sm")}</a>`).join("")}</div>
        </div>
        <div><h5>Sections</h5><div class="footer-links">${C.NAV.slice(1).map((n) => `<a data-page="${n[0]}">${n[1]}</a>`).join("")}</div></div>
        <div><h5>Catalogue</h5><div class="footer-links">${V.productCategories.map((c) => `<a data-page="products">${c.label}</a>`).join("")}</div></div>
        <div><h5>Get a quote</h5><p style="font-size:13px;color:#8ba0c6;line-height:1.6">${V.contact.phone}<br>${V.contact.email}</p><a class="btn btn-gold btn-sm" style="margin-top:12px" data-cta="Request quote → sign-in (M3).">${I("send", "ic-sm")} Request quote</a></div>
      </div>
      <div class="footer-bottom"><span>© ${V.established}–2026 ${V.name} · Member since ${V.memberSince}</span><span>Powered by <b style="color:#fff">iVendorz</b> — Bangladesh's Industrial Procurement OS</span></div>
    </div></footer>`;
  };

  // compact interior-page header band (breadcrumb + title)
  C.pageHead = function (title, sub) {
    return `<div class="page-head"><div class="wrap">
      <div class="breadcrumb"><a data-page="home">Home</a>${I("chevron-right")}<span>${title}</span></div>
      <h1 class="page-title">${title}</h1>${sub ? `<p class="page-sub">${sub}</p>` : ""}
    </div></div>`;
  };

  // shared catalogue body (products page / catalogue-home) — optional sticky filter rail
  C.catalogueBody = function (withRail) {
    const specFacets = [
      { h: "Standard", opts: [["API 6D", 14], ["ASME B16.5", 22], ["ASTM A234", 18], ["DIN / EN", 11]] },
      { h: "Material", opts: [["Cast steel (WCB)", 26], ["Stainless (CF8M)", 19], ["Forged (A105N)", 15], ["Ductile iron", 9]] },
      { h: "Connection", opts: [["Flanged", 40], ["Butt-weld", 24], ["Threaded", 12], ["Wafer", 8]] },
    ];
    const rail =
      `<aside class="filter-rail">
        <div class="search-bar" style="margin-bottom:14px">${I("search", "ic-sm")}<input placeholder="Search products…" data-cta="Search — presentation-only mock." readonly></div>
        <div class="filter-group"><h5>Category</h5>${V.productCategories.map((c) => `<div class="filter-opt" data-cta="Filter “${c.label}” — mock."><span>${c.label}</span><span class="n">${c.count}</span></div>`).join("")}</div>
        ${specFacets.map((g) => `<div class="filter-group"><h5>${g.h}</h5>${g.opts.map((o) => `<label class="filter-opt" data-cta="Facet “${o[0]}” — mock."><span>${I("plus", "ic-sm")} ${o[0]}</span><span class="n">${o[1]}</span></label>`).join("")}</div>`).join("")}
      </aside>`;
    const total = V.productCategories.reduce((a, c) => a + c.count, 0);
    const main =
      `<div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px;flex-wrap:wrap">
          <div>${C.catNav()}</div>
          <div style="font-size:13px;color:var(--iv-fg-muted)">Showing <b style="color:var(--iv-fg-heading)">${V.products.length}</b> of ${total} products</div>
        </div>
        ${C.productGrid(V.products, withRail ? 3 : 4)}
        <div style="text-align:center;margin-top:26px"><a class="btn btn-outline" data-cta="Load more — mock.">Load more products ${I("chevron-down", "ic-sm")}</a></div>
      </div>`;
    return withRail ? `<div class="catalogue-layout">${rail}${main}</div>` : main;
  };

  // Downloads block (was the Resources page; now merged into About).
  C.downloads = function () {
    return `<section class="section" data-section="resources"><div class="wrap">${head("Resources", "Documents & downloads", "")}
      <div class="dl-grid">
        <a class="dl-card" data-cta="Company profile PDF — mock download.">${I("file-text", "ic-lg")}<div><div class="dl-name">Company profile (PDF)</div><div class="dl-meta">6.2 MB · updated Jun 2026</div></div>${I("download")}</a>
        <a class="dl-card" data-cta="Product catalogue PDF — mock download.">${I("file-text", "ic-lg")}<div><div class="dl-name">Product catalogue (PDF)</div><div class="dl-meta">18 MB · 180 SKUs</div></div>${I("download")}</a>
        <a class="dl-card" data-cta="Line card — mock download.">${I("file-text", "ic-lg")}<div><div class="dl-name">Line card & standards sheet</div><div class="dl-meta">1.1 MB</div></div>${I("download")}</a>
      </div></div></section>`;
  };

  // ---- interior PAGES (return page body; the shell owns header/footer) ----
  // About now ABSORBS the former Resources page (certifications · gallery · downloads),
  // per the 2026-07-08 owner amendment.
  C.pageAbout = function () {
    return (
      C.pageHead("About " + SHORT, V.businessSummary) +
      C.about(true) +
      C.capabilities() +
      C.services(true) +
      C.businessInfo() +
      C.team(true) +
      C.factory() +
      C.clients(true) +
      C.certifications() +
      C.gallery(true) +
      C.downloads()
    );
  };
  C.pageProducts = function (withRail) {
    return (
      C.pageHead("Product catalogue", "Browse the full range by category and specification. Prices are shared on inquiry — send a request to sign in.") +
      `<section class="section" data-section="products"><div class="wrap">${C.catalogueBody(withRail)}</div></section>` +
      C.capabilities(true)
    );
  };
  C.pageProjects = function () {
    return C.pageHead("Projects & track record", "Selected delivered work — a curated slice, never a computed ranking.") + C.projects("cards") + C.projects("timeline", true) + C.gallery();
  };
  C.pageContact = function () {
    return C.pageHead("Contact " + SHORT, "Send a quote request or reach the team directly.") + C.contact() + C.related(true);
  };

  // ---- HOME (curated landing per template) ----
  function projCardsN(n) {
    return `<div class="project-grid">${V.projects
      .slice(0, n)
      .map(
        (p) => `<article class="project-card">
      <div class="project-media"><img src="${p.img}" alt="${p.name}"><span class="badge badge-navy sector-tag">${p.sector}</span></div>
      <div class="project-body"><div class="project-client">${p.client} · ${p.year}</div><h3 class="project-name">${p.name}</h3><p class="project-scope">${p.scope}</p>
      <div class="project-foot"><span class="project-value">${p.value}</span></div></div></article>`,
      )
      .join("")}</div>`;
  }
  C.home = function (variant) {
    const aboutSummary = `<section class="section" data-section="about"><div class="wrap">
      ${head("Who we are", "About " + SHORT, "")}
      <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:32px;align-items:start" class="about-split">
        <div style="color:var(--iv-fg-secondary);line-height:1.7">${V.aboutCompany[0]}<div>${C.viewAll("about", "About the company")}</div></div>
        <div class="card card-pad">${C.trustWidget().replace('data-section="trust"', "")}<div style="margin-top:16px">${C.capMatrix()}</div></div>
      </div></div></section>`;
    const featProducts = `<section class="section section-alt" data-section="products"><div class="wrap">
      ${head("Catalogue", "Featured products", "A curated, editorial selection — not a ranked list.")}
      <div style="margin-bottom:18px">${C.catNav()}</div>${C.productGrid(V.products.slice(0, 4), 4)}
      ${C.viewAll("products", "View full catalogue")}</div></section>`;
    const featProjects = `<section class="section" data-section="projects"><div class="wrap">
      ${head("Track record", "Featured projects", "A curated slice of delivered work.")}${projCardsN(2)}
      ${C.viewAll("projects", "See all projects")}</div></section>`;
    const indPrev = `<section class="section section-alt" data-section="industries"><div class="wrap">
      ${head("Sectors", "Industries served", "")}<div class="industry-grid">${V.industries.map((n) => `<div class="industry-chip">${I(n.icon)} ${n.label}</div>`).join("")}</div></div></section>`;
    return [
      C.hero(variant),
      C.stats(),
      aboutSummary,
      C.capabilities(),
      featProducts,
      featProjects,
      indPrev,
      C.ctaBand(),
    ].join("");
  };

  // expose the private scaffolding so bespoke per-layout bodies stay consistent
  C.sectionHead = head;
  C.wrapSection = sec;

  window.C = C;
})();
