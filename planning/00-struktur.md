# Sketch 0: Neue Repo-Struktur & Build

> Alle Dateien in `planning/` sind nur Skizzen zum Diskutieren.
> Bearbeite sie direkt, schreib Kommentare rein, lösch was dir nicht gefällt.

## Seiten (neu: 3 Hauptseiten statt 5)

| Live-URL              | Inhalt                                            | ersetzt              |
| --------------------- | ------------------------------------------------- | -------------------- |
| `/` (index)           | **Forschung**: Papers, Talks, Workshops, Funding  | index + publications |
| `/cv`                 | Lebenslauf: Education, Teaching, Awards, Software-Erfahrung | about       |
| `/software`           | KoKi & weitere Software-Projekte                  | projects             |
| `/impressum`, `/datenschutz` | wie gehabt                                 | —                    |

Entfällt: `publications.html` (→ Redirect auf `/#publications`),
`contact.html` (→ Kontakt-Block im Footer jeder Seite),
`theoremdatabase/` (raus? — sag Bescheid, falls du das noch brauchst).
Bleibt: `server/` (lokaler Dev-Server).

## Navigation (oben)

```
[Foto/Logo]   Research   CV   Software        [EN | DE | (später JA)]
```

„Publications" verschwindet als Reiter — die Paper stehen direkt auf der Startseite.

## Ordnerstruktur im Repo

```
src/
  templates/
    base.html          ← Gerüst: <head>, Nav, Footer, {{year}}, JSON-LD
  pages/
    index.html         ← nur Inhalt der Forschungsseite
    cv.html
    software.html
    impressum.html
    datenschutz.html
  i18n/
    en.json            ← alle Text-Schnipsel, die übersetzt werden
    de.json            ← (Stufe 2)
data/
  talks.json           ← Vorträge & Workshops (NEU, siehe Sketch 04)
  projects.json        ← erweitert um role/funding (siehe Sketch 04)
scripts/
  build.js             ← EIN Skript, null Dependencies:
                          ORCID fetchen → Publikations-HTML rendern,
                          Templates zusammensetzen, {{platzhalter}} füllen,
                          Output ins Repo-Root schreiben (+ /de/ in Stufe 2)
.github/workflows/
  build.yml            ← läuft bei jedem Push + täglich 5:00 UTC (ORCID-Refresh),
                          committet Output nur bei Änderung   [deine „Variante 2“]
index.html, cv.html, … ← GENERIERT (mit Warnkommentar oben), bleiben im Repo
server/                ← bleibt, dient lokal: node scripts/build.js && node server/server.js
```

## Sprachen (Stufe 2, Infrastruktur wird aber gleich mitgebaut)

- Englisch ist Hauptsprache und liegt im Root (`/`).
- Später: `/de/…` (und `/ja/…`) werden vom selben Build aus `i18n/*.json` generiert,
  mit `hreflang`-Tags verlinkt. Kein Mehraufwand pro Seite — nur Übersetzungs-JSON pflegen.
- Umschalter: simple Links oben rechts in der Nav.

## SEO-Maßnahmen (macht der Build automatisch)

- Publikationen als fertiges HTML im Quelltext (kein Client-Fetch mehr)
- pro Paper: `ScholarlyArticle`-JSON-LD + `citation_*`-Meta-Tags (Google Scholar)
- ORCID prominent verlinkt (Badge im Hero + JSON-LD `sameAs`)
- sitemap.xml wird mitgeneriert, Copyright-Jahr automatisch
