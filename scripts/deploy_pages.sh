#!/usr/bin/env bash
# Builds the static export and publishes it to the `gh-pages` branch (Pages: "Deploy from a branch").
# Works without GitHub Actions. Usage: npm run deploy
set -euo pipefail
cd "$(dirname "$0")/.."
URL="${PAGES_SITE_URL:-https://watchdoglab.github.io}"
BASE="${PAGES_BASE_PATH:-}"
echo "→ building static export for $URL"
rm -rf out .next
NEXT_PUBLIC_SITE_URL="$URL" NEXT_PUBLIC_BASE_PATH="$BASE" npm run build
touch out/.nojekyll
# Pages picks Content-Type from the extension, so give share images a .png name and point the tags at it.
find out -type f -name opengraph-image -exec mv {} {}.png \;
find out -type f \( -name '*.html' -o -name '*.txt' \) -exec perl -pi -e 's#/opengraph-image\?[0-9a-f]+#/opengraph-image.png#g' {} +
echo "→ publishing out/ to gh-pages"
REMOTE="$(git remote get-url origin)"
( cd out && git init -q -b gh-pages && git add -A && git commit -q -m "deploy: static export" && git push -f -q "$REMOTE" gh-pages )
rm -rf out/.git
echo "✔ pushed. Live at $URL/ in a minute or two"
