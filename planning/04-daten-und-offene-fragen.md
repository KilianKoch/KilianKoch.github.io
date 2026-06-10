# Sketch 4: Datenformate & offene Fragen

## data/talks.json (NEU) — so trägst du künftig Vorträge ein

```json
[
  {
    "title": "Thresholding Scheme for the Half-Harmonic Map Heat Flow",
    "event": "Young Researchers Workshop on Geometric Analysis, Singular PDEs and Numerics",
    "venue": "RWTH Aachen",
    "date": "2026-06-01",
    "type": "talk",
    "slides": "/talks/2026-06-aachen-thresholding.pdf",
    "eventUrl": "https://sfb1481.rwth-aachen.de/..."
  },
  {
    "title": "[TODO: Titel]",
    "event": "[TODO: Seminar/Anlass]",
    "venue": "TU Eindhoven",
    "date": "[TODO]",
    "type": "talk",
    "slides": "/talks/[TODO].pdf"
  },
  {
    "title": "Young Researchers Workshop on Geometric Analysis, Singular PDEs and Numerics",
    "event": "joint workshop of CRC 1481, EDDy, IntComSin",
    "venue": "RWTH Aachen",
    "date": "2026-06-01/2026-06-03",
    "type": "organized",
    "role": "Co-organizer [TODO: mit wem?]",
    "eventUrl": "https://sfb1481.rwth-aachen.de/..."
  }
]
```

Ein neuer Vortrag = ein JSON-Eintrag + PDF in `talks/` legen + pushen.
Der Build sortiert nach Datum und trennt `talk` / `organized`.

## data/projects.json — Erweiterung

```json
{
  "title": "C01 Singularity formation in dissipative harmonic flows",
  "...": "wie bisher, plus:",
  "role": "Doctoral researcher",
  "funding": "DFG – CRC 1481 (project no. 442047500)",
  "period": "2024-04 –"
}
```

## Gesammelte offene Fragen (aus allen Sketches)

| # | Frage | Mein Vorschlag |
|---|-------|----------------|
| 1 | Vortragsliste komplett (Titel, Ort, Datum, PDFs)? | — brauche ich von dir |
| 2 | Workshop-Rolle: Co-organizer mit wem? | — brauche ich von dir |
| 3 | Betreuer (Prof. Melcher?) im Hero nennen? | ja, „supervised by" |
| 4 | Kontaktformular behalten? | nein, E-Mail reicht |
| 5 | Welche E-Mail öffentlich? | RWTH-Adresse |
| 6 | theoremdatabase/ löschen? | ja (Git vergisst nichts) |
| 7 | Mittlere Reife im CV? | raus |
| 8 | Soft-Skill-Absätze im CV? | raus, Skills kompakt |
| 9 | Hobbys? | eine Zeile, ganz unten |
| 10 | CV als PDF verlinken? | ja, wenn vorhanden |
| 11 | Code zum Numerik-Paper als Projekt? | ja, wenn es ein Repo gibt |

## Reihenfolge der Umsetzung (nach deinem Feedback)

1. `src/`-Struktur + `build.js` + Umzug der bestehenden Inhalte (alles Englisch)
2. GitHub Action (Push-Build + täglicher ORCID-Refresh, Variante 2: Bot committet)
3. Talks/Events/Funding-Abschnitte mit deinen Daten füllen
4. Aufräumen: alte Seiten, Redirects, sitemap, Meta/JSON-LD forschungszentriert
5. Stufe 2 (später): `i18n/de.json` → `/de/`-Variante, danach ggf. `/ja/`
