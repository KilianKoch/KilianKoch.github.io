#!/usr/bin/env node
// scripts/build-cv.js
//
// Erzeugt den Lebenslauf als LaTeX (LuaLaTeX) direkt aus den Website-Daten
// (data/cv*.json, data/publications.json, data/talks.json) – eine PDF pro Sprache.
//
//   node scripts/build-cv.js             – schreibt geänderte .tex nach cv/build/
//   node scripts/build-cv.js --compile   – zusätzlich lokal mit lualatex bauen + finalisieren
//   node scripts/build-cv.js --finalize  – nach dem Kompilieren (CI): PDFs nach cv/ + Manifest
//
// Das Datum ("Last updated") ändert sich nur, wenn sich der Inhalt ändert:
// Jede .tex wird mit Platzhalter-Datum gehasht und mit cv/manifest.json verglichen.
// Nur bei neuem Hash wird neu kompiliert und das Datum auf heute gesetzt.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const CV_DIR = path.join(ROOT, "cv");
const BUILD_DIR = path.join(CV_DIR, "build");
const MANIFEST = path.join(CV_DIR, "manifest.json");
const DATE_PLACEHOLDER = "@@CVDATE@@";

const LANGS = {
  en: { data: "data/cv.json", file: "Kilian_Koch_CV" },
  de: { data: "data/cv.de.json", file: "Kilian_Koch_Lebenslauf" },
  ja: { data: "data/cv.ja.json", file: "Kilian_Koch_CV_ja" },
};

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const today = () => new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------- Texte

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const L = {
  en: {
    location: "Aachen, Germany",
    pubs: "Publications & Preprints", talks: "Talks", events: "Organized Events",
    upcoming: "upcoming", updated: "Last updated", preprint: "Preprint", slides: "Slides",
    stats: (p, t, e, c) =>
      [plural(p, "paper", "papers"), plural(t, "talk", "talks"),
        plural(e, "organized workshop", "organized workshops"),
        plural(c, "teaching assignment", "teaching assignments")].join(" · "),
  },
  de: {
    location: "Aachen, Deutschland",
    pubs: "Publikationen & Preprints", talks: "Vorträge", events: "Organisierte Veranstaltungen",
    upcoming: "bevorstehend", updated: "Stand", preprint: "Preprint", slides: "Folien",
    stats: (p, t, e, c) =>
      [plural(p, "Arbeit", "Arbeiten"), plural(t, "Vortrag", "Vorträge"),
        plural(e, "organisierter Workshop", "organisierte Workshops"),
        plural(c, "Lehrauftrag", "Lehraufträge")].join(" · "),
  },
  ja: {
    location: "ドイツ・アーヘン",
    pubs: "論文・プレプリント", talks: "講演", events: "主催イベント",
    upcoming: "予定", updated: "最終更新", preprint: "プレプリント", slides: "スライド",
    stats: (p, t, e, c) => `論文 ${p} 件 · 講演 ${t} 件 · 主催ワークショップ ${e} 件 · 担当授業 ${c} 件`,
  },
};

const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
const MONTHS_DE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli",
  "August", "September", "Oktober", "November", "Dezember"];

function fmtDate(iso, lang) {
  const [y, m, d] = iso.split("-").map(Number);
  if (lang === "ja") return `${y}年${m}月${d}日`;
  if (lang === "de") return `${d}. ${MONTHS_DE[m - 1]} ${y}`;
  return `${d} ${MONTHS_EN[m - 1]} ${y}`;
}
function fmtRange(a, b, lang) {
  if (!b) return fmtDate(a, lang);
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  if (y1 === y2 && m1 === m2) {
    if (lang === "ja") return `${y1}年${m1}月${d1}–${d2}日`;
    if (lang === "de") return `${d1}.–${d2}. ${MONTHS_DE[m1 - 1]} ${y1}`;
    return `${d1}–${d2} ${MONTHS_EN[m1 - 1]} ${y1}`;
  }
  return `${fmtDate(a, lang)} – ${fmtDate(b, lang)}`;
}
// "April 2024 – Present" -> "Apr 2024 – Present" (nur Englisch, passt in die Datumsspalte)
const shortMonths = (s, lang) =>
  lang === "en"
    ? s.replace(/\b(January|February|March|April|August|September|October|November|December)\b/g, (m) => m.slice(0, 3))
    : s;

// ---------------------------------------------------------------- HTML -> LaTeX

const ENT = { nbsp: "\u00a0", amp: "&", asymp: "≈", middot: "·", ndash: "–", mdash: "—", quot: '"', lt: "<", gt: ">" };
function esc(s) {
  return String(s)
    .replace(/&([a-z]+);/g, (m, e) => ENT[e] ?? m)
    .replace(/\\/g, "\u0000")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/\u0000/g, "\\textbackslash{}")
    .replace(/\u00a0/g, "~")
    .replace(/≈/g, "$\\approx$");
}
const escUrl = (u) => u.replace(/([%#&])/g, "\\$1");
function tex(html) {
  if (!html) return "";
  let out = "";
  for (const tok of html.split(/(<[^>]+>)/)) {
    const m = tok.match(/^<\s*(\/)?\s*([a-zA-Z]+)([^>]*)>$/);
    if (!m) {
      out += esc(tok);
      continue;
    }
    const [, close, tag, attrs] = m;
    const t = tag.toLowerCase();
    if (t === "br") out += "\\newline ";
    else if (t === "strong" || t === "b") out += close ? "}" : "\\textbf{";
    else if (t === "em" || t === "i") out += close ? "}" : "\\emph{";
    else if (t === "a") {
      const href = (attrs.match(/href="([^"]*)"/) || [, ""])[1].replace(/&amp;/g, "&");
      out += close ? "}" : `\\href{${escUrl(href)}}{`;
    }
  }
  return out;
}

// ---------------------------------------------------------------- Dokument

function renderCv(lang, { site, pubs, talksAll }) {
  const t = L[lang];
  const cv = readJson(LANGS[lang].data);
  const sec = Object.fromEntries(cv.sections.map((s) => [s.id, s]));
  const talks = talksAll.filter((x) => x.type === "talk").sort((a, b) => b.date.localeCompare(a.date));
  const events = talksAll.filter((x) => x.type === "organized").sort((a, b) => b.date.localeCompare(a.date));
  const now = today();

  const list = (title, items) =>
    `\\section{${title}}\n\\begin{entries}\n${items.join("\n")}\n\\end{entries}\n`;

  const timeline = (s, withDetails) =>
    s
      ? list(tex(s.title), s.entries.map((e) =>
          `  \\item[${tex(shortMonths(e.date, lang))}] \\entrytitle{${tex(e.role)}}\\par\\entryorg{${tex(e.org)}}` +
          (withDetails && e.detailsHtml ? `\\par\\entrydetails{${tex(e.detailsHtml)}}` : "")))
      : "";

  const bullets = (s) =>
    s
      ? `\\section{${tex(s.title)}}\n\\begin{itemize}[leftmargin=1.2em,itemsep=2pt,topsep=2pt]\n` +
        s.entries.map((e) => `  \\item ${tex(e.html)}`).join("\n") + "\n\\end{itemize}\n"
      : "";

  const arxivId = (doi) => ((doi || "").match(/arxiv\.(.+)$/i) || [])[1];
  const publications = pubs.length
    ? list(esc(t.pubs), pubs.map((p) => {
        const id = arxivId(p.doi);
        const where = id ? `${t.preprint}, \\href{https://arxiv.org/abs/${id}}{arXiv:${id}}` : esc(p.journal);
        const authors = p.authors.map((a) => (a === site.name ? `\\textbf{${esc(a)}}` : esc(a))).join(", ");
        return `  \\item[${p.year}] \\entrytitle{${esc(p.title)}}\\par\\entryorg{${authors}}\\par\\entrydetails{${where}}`;
      }))
    : "";

  const talkList = talks.length
    ? list(esc(t.talks), talks.map((x) => {
        const up = x.date >= now ? ` \\badge{${t.upcoming}}` : "";
        const slides = x.slides && x.slidesPublic
          ? `\\par\\entrydetails{\\href{${site.baseUrl}${x.slides}}{\\faFilePdf[regular]~${t.slides}}}`
          : "";
        return `  \\item[${fmtDate(x.date, lang)}] \\entrytitle{${esc(x.title)}}${up}\\par\\entryorg{${esc(x.event)}, ${esc(x.venue)}}${slides}`;
      }))
    : "";

  // Rollenbezeichnung ("Organizer") wie auf der Website über src/i18n/<lang>.json übersetzen
  const roles = readJson(`src/i18n/${lang}.json`).talks?.roles ?? {};
  const eventList = events.length
    ? list(esc(t.events), events.map((e) =>
        `  \\item[${fmtRange(e.date, e.dateEnd, lang)}] \\entrytitle{${esc(e.title)}}\\par\\entryorg{${e.role ? `\\textbf{${esc(roles[e.role] ?? e.role)}} · ` : ""}${esc(e.event)}, ${esc(e.venue)}}`))
    : "";

  const stats = t.stats(pubs.length, talks.length, events.length, sec.teaching ? sec.teaching.entries.length : 0);
  const sub = cv.subtitle.split(" · ");
  const ja = lang === "ja";

  return String.raw`% GENERIERTE DATEI – nicht von Hand editieren! Quelle: scripts/build-cv.js + data/
\documentclass[10pt]{article}
\usepackage[a4paper,left=2cm,right=2cm,top=1.7cm,bottom=2.2cm]{geometry}
\usepackage{fontspec}
${ja ? "\\usepackage[haranoaji]{luatexja-preset}\n\\renewcommand{\\kanjifamilydefault}{\\gtdefault}\n\\ltjsetparameter{jacharrange={-4}}" : ""}
\setmainfont{FiraSans}[Extension=.otf,UprightFont=*-Light,BoldFont=*-SemiBold,ItalicFont=*-LightItalic,BoldItalicFont=*-SemiBoldItalic]
\usepackage{${ja ? "" : "microtype,"}xcolor,titlesec,enumitem,fancyhdr,lastpage,qrcode,fontawesome5,academicons}
\definecolor{accent}{RGB}{0,84,159}
\usepackage[colorlinks,urlcolor=accent,linkcolor=accent,pdftitle={Curriculum Vitae -- ${site.name}},pdfauthor={${site.name}},pdflang={${lang}}]{hyperref}
\setlength{\parindent}{0pt}
\titleformat{\section}{\color{accent}\bfseries\addfontfeature{LetterSpace=6}}{}{0pt}{\MakeUppercase}[\vspace{-0.6em}{\color{accent!25}\rule{\linewidth}{0.8pt}}]
\titlespacing*{\section}{0pt}{1.1em}{0.55em}
\newenvironment{entries}{\begin{list}{}{%
  \setlength{\leftmargin}{3.3cm}\setlength{\labelwidth}{2.95cm}\setlength{\labelsep}{0.35cm}%
  \setlength{\itemsep}{5pt}\setlength{\parsep}{0pt}\setlength{\topsep}{2pt}%
  \renewcommand{\makelabel}[1]{\raisebox{0pt}[\height][0pt]{\parbox[t]{\labelwidth}{\raggedright\leavevmode\small\color{accent}##1}}}}}{\end{list}}
\newcommand{\entrytitle}[1]{\textbf{#1}}
\newcommand{\entryorg}[1]{{\color{black!70}#1}}
\newcommand{\entrydetails}[1]{\vspace{1pt}{\small\color{black!75}#1}}
\newcommand{\badge}[1]{\raisebox{1pt}{\colorbox{accent!12}{\scriptsize\bfseries\color{accent}\MakeUppercase{#1}}}}
\pagestyle{fancy}\fancyhf{}\renewcommand{\headrulewidth}{0pt}
\lfoot{\footnotesize\color{black!50}${t.updated}: ${DATE_PLACEHOLDER}}
\cfoot{\footnotesize\href{${site.baseUrl}}{\color{black!50}kiliankoch.de}}
\rfoot{\footnotesize\color{black!50}\thepage/\pageref{LastPage}}
\begin{document}
\begin{minipage}[c]{0.8\linewidth}
  {\fontsize{28}{32}\selectfont\bfseries\color{accent}${esc(cv.name)}}\par\vspace{4pt}
  {\large ${tex(sub[0])}}\par
  {\color{black!70}${tex(sub.slice(1).join(" · "))}}\par\vspace{7pt}
  {\small \faMapMarker*~${esc(t.location)}\quad \faEnvelope[regular]~\href{mailto:${site.email}}{${esc(site.email)}}\quad \faGlobe~\href{${site.baseUrl}}{kiliankoch.de}\\[2pt]
  \aiOrcid~\href{https://orcid.org/${site.orcid}}{${site.orcid}}\quad \faGithub~\href{${site.github}}{KilianKoch}\quad \faLinkedin~\href{${site.linkedin}}{LinkedIn}}
\end{minipage}\hfill
\begin{minipage}[c]{0.15\linewidth}\centering
  \qrcode[height=2.1cm]{${site.baseUrl}}\\[2pt]{\tiny\color{black!55}kiliankoch.de}
\end{minipage}
\par\vspace{10pt}
${tex(cv.summary)}\par\vspace{4pt}
{\small\color{black!55}${stats}}
${timeline(sec.positions, true)}
${timeline(sec.education, false)}
${publications}
${talkList}
${eventList}
${timeline(sec.teaching, true)}
${bullets(sec.funding)}
${bullets(sec.awards)}
${bullets(sec.skills)}
\end{document}
`;
}

// ---------------------------------------------------------------- Ablauf

const readManifest = () => (fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {});
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

function generate() {
  const ctx = {
    site: readJson("src/site.json"),
    pubs: readJson("data/publications.json"),
    talksAll: readJson("data/talks.json"),
  };
  const manifest = readManifest();
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  fs.mkdirSync(BUILD_DIR, { recursive: true });

  const changed = [];
  for (const lang of Object.keys(LANGS)) {
    const source = renderCv(lang, ctx);
    const hash = sha(source);
    const pdf = path.join(CV_DIR, `${LANGS[lang].file}.pdf`);
    if (manifest[lang]?.hash === hash && fs.existsSync(pdf)) continue;
    const date = today();
    fs.writeFileSync(path.join(BUILD_DIR, `${LANGS[lang].file}.tex`), source.replaceAll(DATE_PLACEHOLDER, fmtDate(date, lang)));
    fs.writeFileSync(path.join(BUILD_DIR, `${LANGS[lang].file}.pending.json`), JSON.stringify({ lang, hash, date }));
    changed.push(lang);
  }

  console.log(changed.length ? `CV geändert: ${changed.join(", ")}` : "CV unverändert – kein Neubau nötig.");
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed.length > 0}\n`);
  }
  return changed;
}

// Fertige PDFs aus cv/build/ nach cv/ verschieben und Manifest aktualisieren
function finalize() {
  const manifest = readManifest();
  if (!fs.existsSync(BUILD_DIR)) return;
  for (const f of fs.readdirSync(BUILD_DIR).filter((f) => f.endsWith(".pending.json"))) {
    const { lang, hash, date } = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, f), "utf8"));
    const name = `${LANGS[lang].file}.pdf`;
    const built = path.join(BUILD_DIR, name);
    if (!fs.existsSync(built)) throw new Error(`PDF fehlt: cv/build/${name}`);
    fs.copyFileSync(built, path.join(CV_DIR, name));
    manifest[lang] = { file: `/cv/${name}`, hash, date };
    console.log(`PDF aktualisiert: cv/${name} (${date})`);
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
}

function compileLocally() {
  for (const f of fs.readdirSync(BUILD_DIR).filter((f) => f.endsWith(".tex"))) {
    for (let i = 0; i < 2; i++) {
      execFileSync("lualatex", ["-interaction=nonstopmode", "-halt-on-error", f], { cwd: BUILD_DIR, stdio: "ignore" });
    }
  }
}

const args = process.argv.slice(2);
if (args.includes("--finalize")) {
  finalize();
} else {
  const changed = generate();
  if (args.includes("--compile") && changed.length) {
    compileLocally();
    finalize();
  }
}
