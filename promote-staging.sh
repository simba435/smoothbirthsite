#!/usr/bin/env bash
# ==============================================================================
# promote-staging.sh - Promote Staging Pages to Production
# Smooth Birth Apothecary Website
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PAGES=(
    "index"
    "about"
    "founder"
    "wholesale"
    "thanks"
    "privacy"
    "terms"
    "swell-away"
    "deep-rest-1"
    "deep-rest-2"
    "cool-center"
    "getting-ready"
    "boost-up"
    "more-oomph"
    "high-baby"
    "turn-around"
    "abundant-flow"
)

promote_page() {
    local page="$1"
    local staging_file="${page}-staging.html"
    local prod_file="${page}.html"

    if [ ! -f "$staging_file" ]; then
        echo "❌ Error: $staging_file does not exist."
        return 1
    fi

    echo "🚀 Promoting $staging_file -> $prod_file..."

    python3 -c "
import re, os

with open('$staging_file', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove staging banner
content = re.sub(r'^[ \t]*<!-- STAGING_BANNER_START -->.*?<!-- STAGING_BANNER_END -->\r?\n', '', content, flags=re.DOTALL | re.MULTILINE)

# 2. Remove noindex meta
content = re.sub(r'^[ \t]*<meta name=\"robots\" content=\"noindex, nofollow\">\r?\n', '', content, flags=re.MULTILINE)

# 3. Remove [Staging] suffix from title
content = re.sub(r' \[Staging\]', '', content)

# 4. Convert all -staging.html links and meta refresh URLs back to .html
content = re.sub(r'href=\"([a-zA-Z0-9_-]+)-staging\.html', r'href=\"\1.html', content)
content = re.sub(r'url=([a-zA-Z0-9_-]+)-staging\.html', r'url=\1.html', content)

# 5. Convert any -staging.html in Formspree _next redirects
content = content.replace('smoothbirth.com/thanks-staging.html', 'smoothbirth.com/thanks.html')

tmp_file = '$prod_file.tmp'
with open(tmp_file, 'w', encoding='utf-8') as f:
    f.write(content)

os.replace(tmp_file, '$prod_file')
os.chmod('$prod_file', 0o664)
"
    echo "✅ Successfully promoted $prod_file"
}

TARGET="${1:-help}"

if [ "$TARGET" = "all" ]; then
    echo "🌿 Promoting ALL ${#PAGES[@]} staging pages to production..."
    for p in "${PAGES[@]}"; do
        promote_page "$p"
    done
    echo ""
    echo "📋 Git diff summary of production files:"
    git diff "${PAGES[@]/%/.html}"
    echo ""
    echo "🎉 Done! Review diffs above and run:"
    echo "   git add *.html"
    echo "   git commit -m 'Promote staged changes to production'"
    echo "   git push origin main"
elif [ -f "${TARGET}-staging.html" ]; then
    promote_page "$TARGET"
    echo ""
    echo "📋 Git diff for ${TARGET}.html:"
    git diff "${TARGET}.html"
    echo ""
    echo "🎉 Done! Review diff above and run:"
    echo "   git add ${TARGET}.html"
    echo "   git commit -m 'Promote ${TARGET} staging to production'"
    echo "   git push origin main"
else
    echo "Usage: ./promote-staging.sh <page|all>"
    echo ""
    echo "Available pages (${#PAGES[@]} total):"
    for p in "${PAGES[@]}"; do
        echo "  $p (promotes ${p}-staging.html -> ${p}.html)"
    done
    echo "  all (promotes all ${#PAGES[@]} staging pages to production)"
    echo ""
    echo "Examples:"
    echo "  ./promote-staging.sh index"
    echo "  ./promote-staging.sh swell-away"
    echo "  ./promote-staging.sh all"
    exit 1
fi
