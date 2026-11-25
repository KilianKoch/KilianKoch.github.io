#!/usr/bin/env bash
# Erzeugt aus jedem Vortrags-PDF ein Thumbnail.
#   talks/<name>.pdf  ->  images/talks/<name>.webp
# Welche Seite: "thumbPage" beim Vortrag in data/talks.json, sonst Seite 1 (Titelfolie).
# Voraussetzung: poppler (pdftocairo), ImageMagick (magick/convert) und node.
# Nutzung:  bash scripts/make-talk-thumbs.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/images/talks"
shopt -s nullglob

if command -v magick >/dev/null 2>&1; then IM=(magick); else IM=(convert); fi

for pdf in "$ROOT"/talks/*.pdf; do
  base="$(basename "$pdf" .pdf)"
  page="$(node -e '
    const t = require(process.argv[1]).find((x) => x.slides === "/talks/" + process.argv[2] + ".pdf");
    console.log((t && Number.isInteger(t.thumbPage) && t.thumbPage > 0) ? t.thumbPage : 1);
  ' "$ROOT/data/talks.json" "$base")"
  prefix="$(mktemp -u)"
  pdftocairo -png -singlefile -f "$page" -l "$page" -scale-to 640 "$pdf" "$prefix"
  "${IM[@]}" "$prefix.png" -quality 82 "$ROOT/images/talks/$base.webp"
  rm -f "$prefix.png"
  echo "Thumbnail: images/talks/$base.webp (Seite $page)"
done
