# TODO & offene Punkte

Stand: 2026-06-18. Der gesamte Umbau liegt auf dem Branch **`research-redesign`**
(noch **nicht** auf `main`, d.h. die Live-Seite über GitHub Pages ist unverändert).

---

## Vor dem Publish (technisch)

- [ ] **Merge `research-redesign` → `main`** — das ist der eigentliche Go-Live.
      Danach baut die GitHub Action und Pages deployt von `main`.
- [ ] **Repo-Setting: Actions-Schreibrechte** prüfen/aktivieren:
      *Settings → Actions → General → Workflow permissions →* **„Read and write permissions"**.
      Ohne das kann die tägliche Action ihre Rebuild-Commits nicht pushen (Fehler 403).
- [ ] **Pages-Quelle** bestätigen: *Settings → Pages →* „Deploy from a branch: `main` / root".
      (War vorher schon so, da die alte Seite lief.)

## Offene inhaltliche Punkte (gehen auch nach dem Publish)

- [ ] **Workshop-Mitorganisatoren** ergänzen — in `data/talks.json` steht beim
      Young Researchers Workshop aktuell nur `"role": "Co-organizer"`.
      Optional die anderen 3 Namen ergänzen.
- [ ] **Betreuer im Hero?** (z.B. „supervised by Prof. Melcher") — nie entschieden.
      Für Postdoc-Bewerbungen (Japan) üblich. Bei Bedarf in `src/pages/*/index.html`.
- [ ] **CV-PDF-Feinschliff** — zurückgestellt. Aktuell ist die automatische
      PDF-Erzeugung **deaktiviert** (kein Link auf der CV-Seite). Quellen liegen
      bereit: `src/pages/en/cv-print.html`, `css/cv-print.css`, `scripts/make-cv-pdf.sh`.
      Zum Reaktivieren: Schritt in `.github/workflows/build.yml` wieder einfügen +
      Download-Link auf den CV-Seiten ergänzen.
- [ ] **Weitere Paper** in ORCID eintragen, sobald fertig (2 Paper ~in Arbeit) —
      Website **und** PDF ziehen automatisch nach (täglicher ORCID-Refresh).
- [ ] **Forschungscode** (Thresholding / Numerik) als Software-Projekt ergänzen,
      sobald ein Repo existiert; idealerweise mit Zenodo-DOI.

## Erledigt (Referenz)

- Forschungs-first-Umbau: Startseite (Publications/Talks/Events/Funding), CV, Software
- Mehrsprachig EN/DE/JA mit Sprach-Dropdown, `hreflang`, lokalisierter 404
- ORCID-Paper zur Build-Zeit eingebacken (SEO: citation-Meta + JSON-LD)
- Talks mit Abstract, Folien-Download + Thumbnail (Thresholding, Eindhoven)
- Impressum/Datenschutz pro Sprache (ohne DE/EN-Button), neues Design
- Software = KoKi direkt (Intro + Galerie + Features + 8 Highlights + Tech)
- Aufgeräumt: verwaiste Bilder, toter CSS, `languageToggle.js`, contact/theoremdatabase
- `.nojekyll`, Cache-Busting, Lehrstuhl-Mail (akademisch) / Privat-Mail (Impressum)

---

## Pflege-Spickzettel (wie füge ich was hinzu)

**Lokaler Workflow:** `node scripts/build.js` → `node server/server.js` →
http://localhost:3000 ansehen → committen/pushen.

- **Neuer Vortrag:** Eintrag in `data/talks.json`. Für öffentliche Folien:
  PDF nach `talks/` legen, `bash scripts/make-talk-thumbs.sh` (erzeugt das
  Thumbnail), `git add -f talks/datei.pdf`, und `"slidesPublic": true` setzen.
  Ohne `slidesPublic` bleibt der Vortrag ohne Download/Thumbnail; PDFs sind
  standardmäßig per `.gitignore` privat.
- **CV ändern:** `data/cv.json` (EN), `data/cv.de.json` (DE), `data/cv.ja.json` (JA).
- **Texte/Übersetzungen:** Seiteninhalte in `src/pages/<lang>/`, kurze UI-Labels
  in `src/i18n/<lang>.json`.
- **Neue Sprache:** in `src/site.json` zu `languages` hinzufügen + `src/i18n/<lang>.json`
  und `src/pages/<lang>/…` anlegen.
