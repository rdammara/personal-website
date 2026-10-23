#!/usr/bin/env bash
# Deploys the newest commit on GitHub's master branch to the live site.
# Cron runs it every 5 minutes; it does nothing unless master has moved.
#
#   deploy.sh           deploy if master changed
#   deploy.sh --force   deploy master even if it is already live
#
# Layout under $BASE (default ~/apps/albertdammara.com):
#   cache/              git clone used to fetch master
#   releases/<id>/      one build per deployed commit (the live one plus the previous)
#   current -> releases/<id>   what PM2 runs
#   shared/.env         secrets and DATABASE_URL (shared by every release)
#   shared/data/        the live SQLite database
#   shared/storage/     Notion images and uploaded resumes
#   shared/backups/     database copies taken before each deploy
#   bin/deploy.sh       this script, refreshed after each successful deploy

set -euo pipefail

BASE="${DEPLOY_BASE:-$HOME/apps/albertdammara.com}"
KEEP_RELEASES=2 # the live build plus one to roll back to; each is about 1 GB
KEEP_BACKUPS=10
HEALTH_URL="http://127.0.0.1:3000/"
FORCE="${1:-}"

log() { echo "$(date -u +%FT%TZ) $*"; }

# One deploy at a time
exec 9>"$BASE/shared/deploy.lock"
flock -n 9 || { log "another deploy is running; skipping"; exit 0; }

cd "$BASE/cache"
git fetch --quiet origin master
TARGET=$(git rev-parse origin/master)
LIVE=$(cat "$BASE/current/REVISION" 2>/dev/null || echo none)

if [[ "$TARGET" == "$LIVE" && "$FORCE" != "--force" ]]; then
  exit 0
fi
# A commit that failed once is not rebuilt every 5 minutes; push a fix or use --force
if [[ -e "$BASE/shared/failed/$TARGET" && "$FORCE" != "--force" ]]; then
  exit 0
fi

SHORT=${TARGET:0:7}
RELEASE="$BASE/releases/$(date -u +%Y%m%d%H%M%S)-$SHORT"
log "deploying $SHORT (live: ${LIVE:0:7})"

fail() {
  log "FAILED at: $1. The live site was not changed."
  mkdir -p "$BASE/shared/failed"
  touch "$BASE/shared/failed/$TARGET"
  rm -rf "$RELEASE"
  exit 1
}

mkdir -p "$RELEASE"
git archive "$TARGET" | tar -x -C "$RELEASE" || fail "unpacking the commit"
echo "$TARGET" > "$RELEASE/REVISION"
ln -s "$BASE/shared/.env" "$RELEASE/.env"
ln -s "$BASE/shared/storage" "$RELEASE/storage"

cd "$RELEASE"
set -a; source "$BASE/shared/.env"; set +a

npm ci --no-audit --no-fund --loglevel=error || fail "npm ci"
npx prisma generate >/dev/null || fail "prisma generate"

# Copy the database before touching its schema
mkdir -p "$BASE/shared/backups"
DB_FILE="${DATABASE_URL#file:}"
cp -p "$DB_FILE" "$BASE/shared/backups/prod-$(date -u +%Y%m%dT%H%M%SZ)-before-$SHORT.db"
# Without --accept-data-loss this refuses any change that would delete data
npx prisma db push --skip-generate || fail "database schema update (would it lose data?)"

npm run build || fail "next build"

# The site runs from .next/standalone (output: 'standalone' in next.config.ts), which holds
# only the files it needs. It serves public/ and .next/static only when they are copied in,
# and reads secrets and uploads from shared/ through links, so a changed .env applies on reload.
SA="$RELEASE/.next/standalone"
[[ -f "$SA/server.js" ]] || fail "standalone build missing"
cp -r "$RELEASE/public" "$SA/public"
cp -r "$RELEASE/.next/static" "$SA/.next/static"
rm -f "$SA/.env"
ln -s "$BASE/shared/.env" "$SA/.env"
ln -sfn "$BASE/shared/storage" "$SA/storage"
# Build-only files: node_modules (~850 MB) and the build cache. Schema changes ran above.
rm -rf "$RELEASE/node_modules" "$RELEASE/.next/cache"

# Reload PM2 from the live release's config. Reload keeps each app's script path, so when a
# release runs the site differently (next start vs standalone server.js), the apps are
# restarted instead; that costs a couple of seconds of downtime, once.
apply_pm2() {
  local config="$BASE/current/deploy/ecosystem.production.config.js"
  local want have
  want=$(node -e "console.log(require('$config').apps.find((a) => a.name === 'personal-website').script)")
  have=$(pm2 jlist | node -e 'let d="";process.stdin.on("data",(c)=>(d+=c)).on("end",()=>{const a=JSON.parse(d).find((p)=>p.name==="personal-website");console.log(a?a.pm2_env.pm_exec_path:"")})')
  if [[ "$want" == "$have" ]]; then
    pm2 startOrReload "$config" --update-env >/dev/null
  else
    log "PM2 apps now run $(basename "$want"); restarting them"
    pm2 delete personal-website notion-sync github-sync >/dev/null 2>&1 || true
    pm2 start "$config" >/dev/null
  fi
}

PREVIOUS=$(readlink -f "$BASE/current" 2>/dev/null || true)
ln -sfn "$RELEASE" "$BASE/current.new" && mv -Tf "$BASE/current.new" "$BASE/current"
apply_pm2

# Give the server a moment, then make sure it answers; roll back if not
ok=""
for _ in $(seq 1 20); do
  sleep 2
  if curl -fsS -o /dev/null --max-time 5 "$HEALTH_URL"; then ok=1; break; fi
done
if [[ -z "$ok" ]]; then
  if [[ -n "$PREVIOUS" && -d "$PREVIOUS" ]]; then
    ln -sfn "$PREVIOUS" "$BASE/current.new" && mv -Tf "$BASE/current.new" "$BASE/current"
    apply_pm2
  fi
  mkdir -p "$BASE/shared/failed"; touch "$BASE/shared/failed/$TARGET"
  log "FAILED: new version did not answer at $HEALTH_URL; rolled back to $(basename "${PREVIOUS:-none}")"
  exit 1
fi
pm2 save >/dev/null

# Refresh this script from the release that just proved it builds and runs
install -m 755 "$RELEASE/deploy/deploy.sh" "$BASE/bin/deploy.sh"

# Housekeeping: old releases and old database copies
ls -1dt "$BASE"/releases/*/ | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf
ls -1t "$BASE"/shared/backups/prod-*.db 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -f

log "live: $SHORT"
