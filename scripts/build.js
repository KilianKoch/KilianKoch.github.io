#!/usr/bin/env node
// scripts/build.js
//
// Statischer Site-Generator ohne Dependencies (Node >= 18).
//
//   node scripts/build.js            – baut alle Seiten ins Repo-Root
//   node scripts/build.js --offline  – überspringt den ORCID-Fetch und
//                                      nutzt den Cache data/publications.json
//
// Quellen:  src/  (Templates, Seiteninhalte, i18n) und data/ (talks, projects)
// Output:   index.html, cv.html, … im Repo-Root (+ /<lang>/ für weitere Sprachen)

const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const DATA = path.join(ROOT, "data");

const GENERATED_WARNING =
  "GENERIERTE DATEI – nicht von Hand editieren! Quelle: src/ – Build: node scripts/build.js";

// ---------------------------------------------------------------- helpers

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fill(template, vars) {
  // Ersetzt {{key}} und {{t.pfad.zum.text}}; unbekannte Platzhalter bleiben
  // stehen, damit Fehler im Output sichtbar sind.
  return template.replace(/\{\{([\w.\-]+)\}\}/g, (match, key) => {
    const value = key
      .split(".")
      .reduce((obj, part) => (obj == null ? undefined : obj[part]), vars);
    return value === undefined ? match : value;
  });
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf-8"));
}

async function exists(file) {
  return fs.access(file).then(() => true, () => false);
}

// Kurzer Hash über CSS/JS-Assets als Cache-Buster (?v=...), damit Browser
// nach jedem Deploy garantiert die aktuellen Styles laden.
async function computeAssetVersion() {
  const files = [
    "css/styles.css",
    "css/publications.css",
    "css/projects.css",
    "scripts/main.js",
    "scripts/navigation.js",
    "scripts/gallery.js",
  ];
  const hash = crypto.createHash("sha1");
  for (const file of files) {
    const full = path.join(ROOT, file);
    if (await exists(full)) hash.update(await fs.readFile(full));
  }
  return hash.digest("hex").slice(0, 10);
}

function formatDate(iso, lang) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  const locale = { en: "en-GB", de: "de-DE", ja: "ja-JP" }[lang] || "en-GB";
  const opts = { year: "numeric", month: "long" };
  if (d) opts.day = "numeric";
  return date.toLocaleDateString(locale, opts);
}

function formatDateRange(start, end, lang) {
  if (!end || end === start) return formatDate(start, lang);
  return `${formatDate(start, lang)} – ${formatDate(end, lang)}`;
}

// ---------------------------------------------------------------- ORCID

async function fetchOrcidPublications(orcidId) {
  const base = `https://pub.orcid.org/v3.0/${orcidId}`;
  const headers = { Accept: "application/json" };

  const res = await fetch(`${base}/works`, { headers });
  if (!res.ok) throw new Error(`ORCID works index: HTTP ${res.status}`);
  const index = await res.json();

  const putCodes = (index.group ?? []).map((g) => g["work-summary"][0]["put-code"]);

  const works = await Promise.all(
    putCodes.map(async (code) => {
      const r = await fetch(`${base}/work/${code}`, { headers });
      if (!r.ok) return null;
      return r.json();
    })
  );

  return works
    .filter(Boolean)
    .map((pub) => {
      const doi =
        pub["external-ids"]?.["external-id"]?.find(
          (id) => id["external-id-type"] === "doi"
        )?.["external-id-value"] ?? null;

      const isArxiv = doi?.toLowerCase().startsWith("10.48550/arxiv.");
      const journal = isArxiv
        ? "arXiv"
        : pub["journal-title"]?.value ?? (pub.type === "preprint" ? "Preprint" : "");

      const link =
        pub["external-ids"]?.["external-id"]?.find((id) => id["external-id-url"]?.value)?.[
          "external-id-url"
        ].value ??
        pub.url?.value ??
        null;

      return {
        title: pub.title?.title?.value ?? "Untitled",
        authors:
          pub.contributors?.contributor?.map(
            (c) => c["credit-name"]?.value || c["contributor-orcid"]?.path || "Unnamed"
          ) ?? [],
        abstract: pub["short-description"] ?? null,
        year: pub["publication-date"]?.year?.value ?? null,
        month: pub["publication-date"]?.month?.value ?? null,
        day: pub["publication-date"]?.day?.value ?? null,
        journal,
        type: pub.type ?? "other",
        doi,
        link,
      };
    })
    .sort((a, b) =>
      `${b.year ?? ""}-${b.month ?? ""}-${b.day ?? ""}`.localeCompare(
        `${a.year ?? ""}-${a.month ?? ""}-${a.day ?? ""}`
      )
    );
}

async function loadPublications(site, offline) {
  const cacheFile = path.join(DATA, "publications.json");
  if (!offline) {
    try {
      const pubs = await fetchOrcidPublications(site.orcid);
      await fs.writeFile(cacheFile, JSON.stringify(pubs, null, 2) + "\n");
      console.log(`ORCID: ${pubs.length} Publikation(en) geladen.`);
      return pubs;
    } catch (err) {
      console.warn(`ORCID-Fetch fehlgeschlagen (${err.message}) – nutze Cache.`);
    }
  }
  if (await exists(cacheFile)) return readJson(cacheFile);
  console.warn("Kein Publikations-Cache vorhanden – Liste bleibt leer.");
  return [];
}

// ---------------------------------------------------------------- renderers

function renderPublications(pubs, t, site) {
  if (pubs.length === 0) {
    return `<p class="empty-note">${escapeHtml(t.publications.none)}</p>`;
  }

  const items = pubs.map((pub) => {
    const date = [pub.year, pub.month, pub.day].filter(Boolean).join("-");
    const typeLabel = t.publications.types[pub.type] ?? t.publications.types.other;

    const authors =
      pub.authors.length > 0
        ? `<div class="publication-authors">${t.publications.by} ${pub.authors
            .map((name) =>
              name === site.name || name.includes("Kilian")
                ? `<strong>${escapeHtml(name)}</strong>`
                : escapeHtml(name)
            )
            .join(", ")}</div>`
        : "";

    const linkButtons = [
      pub.link
        ? `<a class="publication-link" href="${escapeHtml(pub.link)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-book-open"></i> ${t.publications.readOnline}</a>`
        : "",
      pub.doi
        ? `<a class="publication-link publication-link-secondary" href="https://doi.org/${escapeHtml(pub.doi)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-link"></i> DOI</a>`
        : "",
    ].filter(Boolean);
    const links =
      linkButtons.length > 0
        ? `<div class="publication-links">\n      ${linkButtons.join("\n      ")}\n      </div>`
        : "";

    const abstract = pub.abstract
      ? `<details class="publication-abstract-details">
        <summary>${t.publications.showAbstract}</summary>
        <div class="publication-abstract">${escapeHtml(pub.abstract)}</div>
      </details>`
      : "";

    return `  <li class="publication-item">
      <div class="publication-title">${escapeHtml(pub.title)}</div>
      <div class="publication-info">${escapeHtml(pub.journal)} (${escapeHtml(date)})
        <span class="publication-badge">${escapeHtml(typeLabel)}</span></div>
      ${authors}
      ${links}
      ${abstract}
    </li>`;
  });

  return `<ul class="publication-list">\n${items.join("\n")}\n</ul>`;
}

// citation_* Meta-Tags + ScholarlyArticle-JSON-LD für Google Scholar & Co.
function renderPublicationsHead(pubs, site) {
  const meta = pubs
    .map((pub) => {
      const tags = [
        `<meta name="citation_title" content="${escapeHtml(pub.title)}" />`,
        ...pub.authors.map(
          (a) => `<meta name="citation_author" content="${escapeHtml(a)}" />`
        ),
        pub.year
          ? `<meta name="citation_publication_date" content="${[pub.year, pub.month, pub.day].filter(Boolean).join("/")}" />`
          : "",
        pub.doi ? `<meta name="citation_doi" content="${escapeHtml(pub.doi)}" />` : "",
        pub.link
          ? `<meta name="citation_abstract_html_url" content="${escapeHtml(pub.link)}" />`
          : "",
      ];
      return tags.filter(Boolean).join("\n    ");
    })
    .join("\n    ");

  const jsonld = pubs.map((pub) => ({
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: pub.title,
    author: pub.authors.map((a) => ({ "@type": "Person", name: a })),
    datePublished: [pub.year, pub.month, pub.day].filter(Boolean).join("-"),
    ...(pub.doi ? { sameAs: `https://doi.org/${pub.doi}` } : {}),
    ...(pub.link ? { url: pub.link } : {}),
  }));

  const jsonldBlock =
    pubs.length > 0
      ? `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n    </script>`
      : "";

  return `    ${meta}\n    ${jsonldBlock}`;
}

function renderTalks(talks, t, lang) {
  const list = talks
    .filter((talk) => talk.type === "talk")
    .sort((a, b) => b.date.localeCompare(a.date));

  if (list.length === 0) return `<p class="empty-note">${escapeHtml(t.talks.none)}</p>`;

  const items = list.map((talk) => {
    // Folien (Download) + Thumbnail nur, wenn ausdrücklich öffentlich freigegeben
    const slidesPublic = talk.slides && talk.slidesPublic;
    const links = [
      slidesPublic
        ? `<a class="talk-link" href="${escapeHtml(talk.slides)}" download><i class="fas fa-file-pdf"></i> ${t.talks.slides}</a>`
        : "",
      talk.eventUrl
        ? `<a class="talk-link" href="${escapeHtml(talk.eventUrl)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> ${t.talks.eventPage}</a>`
        : "",
    ]
      .filter(Boolean)
      .join("\n        ");

    const abstract = talk.abstract
      ? `<details class="publication-abstract-details">
          <summary>${t.publications.showAbstract}</summary>
          <div class="publication-abstract">${escapeHtml(talk.abstract)}</div>
        </details>`
      : "";

    // talk.thumb wird in main() gesetzt, wenn das Thumbnail existiert
    const thumb =
      slidesPublic && talk.thumb
        ? `<a class="talk-thumb" href="${escapeHtml(talk.slides)}" target="_blank" rel="noopener noreferrer">
        <img src="${escapeHtml(talk.thumb)}" alt="${escapeHtml(talk.title)} – first slide" loading="lazy" />
      </a>`
        : "";

    return `  <li class="publication-item talk-item">
      ${thumb}
      <div class="talk-main">
        <div class="publication-title">${escapeHtml(talk.title)}</div>
        <div class="publication-info">${escapeHtml(talk.event)}, ${escapeHtml(talk.venue)} &middot; ${formatDate(talk.date, lang)}</div>
        ${links}
        ${abstract}
      </div>
    </li>`;
  });

  return `<ul class="publication-list">\n${items.join("\n")}\n</ul>`;
}

function renderEvents(talks, t, lang) {
  const list = talks
    .filter((talk) => talk.type === "organized")
    .sort((a, b) => b.date.localeCompare(a.date));

  if (list.length === 0) return "";

  const items = list.map((ev) => {
    const link = ev.eventUrl
      ? `<a class="talk-link" href="${escapeHtml(ev.eventUrl)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> ${t.talks.eventPage}</a>`
      : "";
    const role = ev.role
      ? ` <span class="publication-badge">${escapeHtml(ev.role)}</span>`
      : "";

    return `  <li class="publication-item talk-item">
      <div class="talk-main">
        <div class="publication-title">${escapeHtml(ev.title)}${role}</div>
        <div class="publication-info">${escapeHtml(ev.event)}, ${escapeHtml(ev.venue)} &middot; ${formatDateRange(ev.date, ev.dateEnd, lang)}</div>
        ${link}
      </div>
    </li>`;
  });

  return `<ul class="publication-list">\n${items.join("\n")}\n</ul>`;
}

function renderProjects(projects, t) {
  return projects
    .filter((p) => p.type === "software")
    .map((project) => {
      const url = project.link?.url ?? "#";
      const external = project.link?.type === "external";
      const target = external ? ` target="_blank" rel="noopener noreferrer"` : "";
      const tags = (project.tags ?? [])
        .map((tag) => `<span class="project-tag">${escapeHtml(tag)}</span>`)
        .join(" ");

      return `    <div class="project-item">
      <img src="/${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" />
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.description)}</p>
      <p>${tags}</p>
      <a href="${escapeHtml(url)}" class="btn"${target}>${t.projects.details}</a>
    </div>`;
    })
    .join("\n");
}

// Lebenslauf (Web-Ansicht): resume-section-Markup wie bisher,
// Teaching als aufklappbare <details>
function renderCvWeb(cv) {
  return cv.sections
    .map((section) => {
      const items = section.entries
        .map((entry) => {
          if (section.style === "list") return `        <li>${entry.html}</li>`;

          const head = `<strong>${entry.org}</strong> ${entry.role}<br />\n          <span class="date">${entry.date}</span>`;
          if (section.style === "collapsible") {
            return `        <li>
          <details>
            <summary>
              ${head}
            </summary>
            <hr>
            <p>${entry.detailsHtml ?? ""}</p>
          </details>
        </li>`;
          }
          const body = entry.detailsHtml ? `\n          <p>${entry.detailsHtml}</p>` : "";
          return `        <li>
          ${head}${body}
        </li>`;
        })
        .join("\n");

      const ulClass = section.style === "collapsible" ? ` class="NoBullets"` : "";
      return `    <div class="resume-section">
      <h3>${section.title}</h3>
      <ul${ulClass}>
${items}
      </ul>
    </div>`;
    })
    .join("\n\n");
}

// Publikationen, Vorträge und organisierte Events als CV-Print-Sektionen
// (aus ORCID-Cache bzw. data/talks.json – bleiben automatisch synchron)
function cvPrintAutoSections(publications, talks, lang) {
  const sections = [];

  if (publications.length > 0) {
    sections.push({
      title: "Publications & Preprints",
      style: "timeline",
      entries: publications.map((pub) => {
        const typeLabel = pub.type === "preprint" ? "preprint" : pub.type.replace(/-/g, " ");
        const doi = pub.doi
          ? `<div class="cvp-details">DOI: <a href="https://doi.org/${escapeHtml(pub.doi)}">${escapeHtml(pub.doi)}</a></div>`
          : "";
        return {
          date: pub.year ?? "",
          role: escapeHtml(pub.title),
          org: `${escapeHtml(pub.authors.join(", "))} &middot; ${escapeHtml(pub.journal)} (${escapeHtml(typeLabel)})`,
          detailsRaw: doi,
        };
      }),
    });
  }

  const talkEntries = talks
    .filter((talk) => talk.type === "talk")
    .sort((a, b) => b.date.localeCompare(a.date));
  if (talkEntries.length > 0) {
    sections.push({
      title: "Talks",
      style: "timeline",
      entries: talkEntries.map((talk) => ({
        date: formatDate(talk.date, lang),
        role: escapeHtml(talk.title),
        org: `${escapeHtml(talk.event)}, ${escapeHtml(talk.venue)}`,
      })),
    });
  }

  const eventEntries = talks
    .filter((talk) => talk.type === "organized")
    .sort((a, b) => b.date.localeCompare(a.date));
  if (eventEntries.length > 0) {
    sections.push({
      title: "Organized Events",
      style: "timeline",
      entries: eventEntries.map((ev) => ({
        date: formatDateRange(ev.date, ev.dateEnd, lang),
        role: `${escapeHtml(ev.title)}${ev.role ? ` (${escapeHtml(ev.role)})` : ""}`,
        org: `${escapeHtml(ev.event)}, ${escapeHtml(ev.venue)}`,
      })),
    });
  }

  return sections;
}

// Lebenslauf (Druck-/PDF-Ansicht): schlichte Typografie, alles ausgeklappt.
// Publikationen/Talks/Events werden nach "Education" automatisch eingefügt.
function renderCvPrint(cv, publications, talks, lang) {
  const sections = [...cv.sections];
  const eduIndex = sections.findIndex((s) => s.id === "education");
  sections.splice(eduIndex + 1, 0, ...cvPrintAutoSections(publications, talks, lang));

  return sections
    .map((section) => {
      let body;
      if (section.style === "list") {
        body = `  <ul class="cvp-list">\n${section.entries
          .map((entry) => `    <li>${entry.html}</li>`)
          .join("\n")}\n  </ul>`;
      } else {
        body = section.entries
          .map((entry) => {
            const details = entry.detailsHtml
              ? `\n      <div class="cvp-details">${entry.detailsHtml}</div>`
              : entry.detailsRaw
                ? `\n      ${entry.detailsRaw}`
                : "";
            return `  <div class="cvp-entry">
    <div class="cvp-when">${entry.date}</div>
    <div class="cvp-what"><strong>${entry.role}</strong><br /><span class="cvp-org">${entry.org}</span>${details}</div>
  </div>`;
          })
          .join("\n");
      }
      return `<section class="cvp-section">\n  <h2>${section.title}</h2>\n${body}\n</section>`;
    })
    .join("\n\n");
}

function renderPersonJsonld(site) {
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.name,
      url: site.baseUrl,
      image: `${site.baseUrl}/images/me.jpeg`,
      sameAs: [`https://orcid.org/${site.orcid}`, site.github, site.linkedin],
      jobTitle: "Doctoral Researcher in Mathematics",
      worksFor: { "@type": "Organization", name: "RWTH Aachen University" },
      alumniOf: { "@type": "CollegeOrUniversity", name: "RWTH Aachen University" },
      description:
        "Kilian Koch is a doctoral researcher in mathematics at RWTH Aachen University (CRC 1481 Sparsity and Singular Structures), working on gradient flows in geometric analysis, in particular well-posedness and singular behaviour of (half-)harmonic map heat flows.",
      knowsAbout: [
        "Mathematical Analysis",
        "Geometric Analysis",
        "Gradient Flows",
        "Harmonic Map Heat Flow",
        "Partial Differential Equations",
        "Applied Mathematics",
        "Numerical Analysis",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Aachen",
        addressCountry: "Germany",
      },
    },
    null,
    2
  );
}

// ---------------------------------------------------------------- pages

function pageHref(page, lang, site) {
  const prefix = lang === site.defaultLanguage ? "" : `/${lang}`;
  if (page.slug === "index") return `${prefix}/`;
  return `${prefix}/${page.output.replace(/\.html$/, "")}`;
}

function renderNav(currentSlug, lang, site, t) {
  const entries = [
    { slug: "index", label: t.nav.research },
    { slug: "cv", label: t.nav.cv },
    { slug: "software", label: t.nav.software },
  ];
  return entries
    .map((entry) => {
      const page = site.pages.find((p) => p.slug === entry.slug);
      const active = entry.slug === currentSlug ? ` class="active"` : "";
      return `        <li><a href="${pageHref(page, lang, site)}"${active}>${entry.label}</a></li>`;
    })
    .join("\n");
}

function renderLangSwitcher(page, lang, site, i18n) {
  if (site.languages.length < 2) return "";
  const entries = site.languages
    .map((code) => {
      if (code === lang)
        return `          <li><span class="lang-current" lang="${code}">${i18n[code].langName}</span></li>`;
      return `          <li><a href="${pageHref(page, code, site)}" lang="${code}" hreflang="${code}">${i18n[code].langName}</a></li>`;
    })
    .join("\n");
  return `      <details class="lang-switcher">
        <summary><i class="fas fa-globe"></i><span class="lang-label">${i18n[lang].langLabel}</span></summary>
        <ul>
${entries}
        </ul>
      </details>`;
}

function renderHreflang(page, site) {
  if (site.languages.length < 2) return "";
  const tags = site.languages.map(
    (code) =>
      `    <link rel="alternate" hreflang="${code}" href="${site.baseUrl}${pageHref(page, code, site)}" />`
  );
  tags.push(
    `    <link rel="alternate" hreflang="x-default" href="${site.baseUrl}${pageHref(page, site.defaultLanguage, site)}" />`
  );
  return tags.join("\n");
}

function parsePage(raw) {
  const match = raw.match(/^<!--meta\s*\n([\s\S]*?)\n-->\s*\n?/);
  if (!match) throw new Error("Seitendatei ohne <!--meta ...> Block");
  return { meta: JSON.parse(match[1]), body: raw.slice(match[0].length) };
}

// ---------------------------------------------------------------- main

async function main() {
  const offline = process.argv.includes("--offline");

  const site = await readJson(path.join(SRC, "site.json"));
  const baseTemplate = await fs.readFile(path.join(SRC, "templates", "base.html"), "utf-8");
  const bareTemplate = await fs.readFile(path.join(SRC, "templates", "bare.html"), "utf-8");

  const i18n = {};
  for (const lang of site.languages) {
    i18n[lang] = await readJson(path.join(SRC, "i18n", `${lang}.json`));
  }

  const publications = await loadPublications(site, offline);
  const talks = (await exists(path.join(DATA, "talks.json")))
    ? await readJson(path.join(DATA, "talks.json"))
    : [];
  const projects = (await exists(path.join(DATA, "projects.json")))
    ? await readJson(path.join(DATA, "projects.json"))
    : [];
  const cv = (await exists(path.join(DATA, "cv.json")))
    ? await readJson(path.join(DATA, "cv.json"))
    : null;

  // Thumbnail pro öffentlich freigegebenem Vortrag verlinken, falls vorhanden
  for (const talk of talks) {
    if (talk.slides && talk.slidesPublic) {
      const base = path.basename(talk.slides).replace(/\.pdf$/i, "");
      if (await exists(path.join(ROOT, "images", "talks", `${base}.webp`))) {
        talk.thumb = `/images/talks/${base}.webp`;
      }
    }
  }

  const year = new Date().getFullYear();
  const assetVersion = await computeAssetVersion();
  const written = [];

  for (const lang of site.languages) {
    const t = i18n[lang];
    const langPrefix = lang === site.defaultLanguage ? "" : `/${lang}`;

    // CV-Daten pro Sprache: data/cv.<lang>.json, sonst Fallback data/cv.json
    const cvLangFile = path.join(DATA, `cv.${lang}.json`);
    const cvData = (await exists(cvLangFile)) ? await readJson(cvLangFile) : cv;

    for (const page of site.pages) {
      // Seiteninhalt: Sprachversion, sonst Fallback auf Default-Sprache
      let pageFile = path.join(SRC, "pages", lang, `${page.slug}.html`);
      if (!(await exists(pageFile))) {
        pageFile = path.join(SRC, "pages", site.defaultLanguage, `${page.slug}.html`);
      }
      const { meta, body } = parsePage(await fs.readFile(pageFile, "utf-8"));

      const vars = {
        ...site,
        t,
        lang,
        langPrefix,
        year,
        assetVersion,
        generatedWarning: GENERATED_WARNING,
        title: meta.title,
        description: meta.description,
        canonical: `${site.baseUrl}${pageHref(page, lang, site)}`,
        hreflang: renderHreflang(page, site),
        navLinks: renderNav(page.slug, lang, site, t),
        langSwitcher: renderLangSwitcher(page, lang, site, i18n),
        jsonldPerson: renderPersonJsonld(site),
        publications: renderPublications(publications, t, site),
        talks: renderTalks(talks, t, lang),
        events: renderEvents(talks, t, lang),
        projects: renderProjects(projects, t),
        cv: cvData ? renderCvWeb(cvData) : "",
        cvPrint: cvData ? renderCvPrint(cvData, publications, talks, lang) : "",
        cvSummary: cvData?.summary ?? "",
        name: site.name,
        headExtra: [
          meta.robots ? `    <meta name="robots" content="${meta.robots}" />` : "",
          meta.includePublicationsMeta ? renderPublicationsHead(publications, site) : "",
        ]
          .filter(Boolean)
          .join("\n"),
      };

      const content = fill(body, vars);
      const template = meta.template === "bare" ? bareTemplate : baseTemplate;
      const html = fill(template, { ...vars, content });

      const outFile =
        lang === site.defaultLanguage
          ? path.join(ROOT, page.output)
          : path.join(ROOT, lang, page.output);
      await fs.mkdir(path.dirname(outFile), { recursive: true });
      await fs.writeFile(outFile, html);
      written.push(path.relative(ROOT, outFile));
    }
  }

  // Redirects für alte URLs (about, projects, publications, contact)
  for (const redirect of site.redirects) {
    const target = redirect.to;
    const html = `<!DOCTYPE html>
<!-- ${GENERATED_WARNING} -->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="robots" content="noindex" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <link rel="canonical" href="${site.baseUrl}${target}" />
    <title>Redirecting…</title>
  </head>
  <body>
    <p>This page has moved: <a href="${target}">${site.baseUrl}${target}</a></p>
  </body>
</html>
`;
    await fs.writeFile(path.join(ROOT, redirect.from), html);
    written.push(redirect.from);
  }

  // sitemap.xml (404 und Redirects bleiben draußen)
  const urls = [];
  for (const lang of site.languages) {
    for (const page of site.pages) {
      if (["404", "datenschutz", "cv-print"].includes(page.slug)) continue;
      urls.push(`${site.baseUrl}${pageHref(page, lang, site)}`);
    }
  }
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
  await fs.writeFile(path.join(ROOT, "sitemap.xml"), sitemap);
  written.push("sitemap.xml");

  console.log(`Build fertig: ${written.length} Datei(en):`);
  for (const file of written) console.log(`  ${file}`);
}

main().catch((err) => {
  console.error("Build fehlgeschlagen:", err);
  process.exit(1);
});
