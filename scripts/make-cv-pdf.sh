#!/usr/bin/env bash
# Generiert cv.pdf aus der gebauten CV-Seite per Headless Chrome.
# Voraussetzung: Site ist gebaut (node scripts/build.js).
# Nutzung:  bash scripts/make-cv-pdf.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PDF_PORT:-3457}"

# Passenden Chrome/Chromium finden
if command -v google-chrome >/dev/null 2>&1; then
  CHROME=(google-chrome)
elif command -v google-chrome-stable >/dev/null 2>&1; then
  CHROME=(google-chrome-stable)
elif command -v chromium-browser >/dev/null 2>&1; then
  CHROME=(chromium-browser)
elif command -v chromium >/dev/null 2>&1; then
  CHROME=(chromium)
elif flatpak info org.chromium.Chromium >/dev/null 2>&1; then
  CHROME=(flatpak run org.chromium.Chromium)
else
  echo "Kein Chrome/Chromium gefunden – cv.pdf wird übersprungen." >&2
  exit 1
fi

PORT="$PORT" node "$ROOT/server/server.js" &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
sleep 2

# Englisch immer; weitere Sprachen nur, wenn eigene CV-Daten existieren
# (data/cv.de.json -> cv-de.pdf, data/cv.ja.json -> cv-ja.pdf, ...)
print_pdf() {
  local url="$1" out="$2"
  "${CHROME[@]}" --headless --disable-gpu --no-sandbox \
    --user-data-dir="$(mktemp -d)" \
    --print-to-pdf="$out" --no-pdf-header-footer \
    --virtual-time-budget=8000 \
    "$url"
  echo "PDF geschrieben: $out"
}

print_pdf "http://localhost:$PORT/cv-print" "$ROOT/cv.pdf"

for langfile in "$ROOT"/data/cv.*.json; do
  [ -e "$langfile" ] || continue
  lang="$(basename "$langfile" .json)"; lang="${lang#cv.}"
  print_pdf "http://localhost:$PORT/$lang/cv-print" "$ROOT/cv-$lang.pdf"
done
