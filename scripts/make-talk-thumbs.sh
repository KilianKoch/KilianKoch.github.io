#!/usr/bin/env bash
# Erzeugt aus der ersten Seite jedes Vortrags-PDFs ein Thumbnail.
#   talks/<name>.pdf  ->  images/talks/<name>.webp
# Voraussetzung: poppler (pdftocairo) und ImageMagick (magick/convert).
# Nutzung:  bash scripts/make-talk-thumbs.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/images/talks"
shopt -s nullglob

if command -v magick >/dev/null 2>&1; then IM=(magick); else IM=(convert); fi

for pdf in "$ROOT"/talks/*.pdf; do
  base="$(basename "$pdf" .pdf)"
  prefix="$(mktemp -u)"
  pdftocairo -png -singlefile -scale-to 640 "$pdf" "$prefix"
  "${IM[@]}" "$prefix.png" -quality 82 "$ROOT/images/talks/$base.webp"
  rm -f "$prefix.png"
  echo "Thumbnail: images/talks/$base.webp"
done
