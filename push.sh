#!/usr/bin/env bash
#
# Push this folder to GitHub, which kicks off the Railway deploy.
#
# Why this script exists: everything in this folder is built and verified, but
# GitHub's web upload form stopped accepting commits partway through the last
# push — the form stages the files and the Commit button silently does nothing,
# which is what GitHub does when it rate-limits rapid commits from the web UI.
# Pushing over git is not subject to that, and is the right way to do this
# anyway.
#
# Run it once:   bash push.sh
#
set -euo pipefail

REPO="https://github.com/saeedabawazeer-source/Marsaa.git"
cd "$(dirname "$0")"

if [ ! -d .git ]; then
  git init
  git remote add origin "$REPO"
  git fetch origin main
  # Keep the repo's history and let these files land on top of it.
  git reset --soft origin/main
fi

git add -A

# Refuse to push secrets. .gitignore already blocks .env*, but a belt-and-braces
# check here is cheap and the repository is public.
if git diff --cached --name-only | grep -qE '(^|/)\.env($|\.)'; then
  echo "REFUSING TO PUSH: an .env file is staged. Remove it and try again." >&2
  exit 1
fi

git status --short

git commit -m "Live APIs fixed against real schemas, thumbnails everywhere, Marsa Daily puzzle

- SAHMK: rewritten against the documented /market/summary/?index=TASI and
  /market/gainers/ shapes. The previous code guessed the response shape, so
  every request failed the tick-count check and fell back silently.
- Twelve Data: SPX/IXIC/WTI are not on the free plan. Swapped to SPY/QQQ/BNO
  plus gold and the dollar crosses, labelled as the instruments they are.
- NewsData: size=50 and 6 countries both exceeded free-plan limits, so every
  request was rejected and the API contributed nothing. Now size=10, 5 countries.
- Relevance gate: added a hard veto list. 'million' and 'deal' were business
  terms, which is how a 911-call-centre story and a defence pact led the page.
- Thumbnails on every list surface, with a real fallback instead of black boxes.
- Marsa Daily: a five-letter Gulf business puzzle, EN and AR, streaks, share card.
- /api/health: per-source status so feed failures stop being invisible."

git push -u origin main
echo
echo "Pushed. Railway should pick it up within a couple of minutes."
echo "Then check https://marsaa-production-6e50.up.railway.app/api/health"
