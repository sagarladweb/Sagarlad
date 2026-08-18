#!/bin/bash
# Persistent production server for the Sagar Lad demo site.
# Owned & managed by launchd (see ~/Library/LaunchAgents/com.sagarlad.site.plist).
#
# Each deploy builds into its own immutable .builds/<timestamp> dir and serves
# from there (via NEXT_DIST_DIR). A later build can therefore NEVER delete the
# hashed CSS/JS chunks a running server is still serving — that was the root
# cause of "CSS not loading" (a live `next start` server whose `.next` got
# rebuilt underneath it).
set -euo pipefail

cd /Users/karandhiver/Developer/Sagarlad/demo/apps/site
export PATH="/Users/karandhiver/.hermes/node/bin:/usr/local/bin:$PATH"
LOG=/tmp/sagarlad-site.log

# Give a just-killed old instance (launchctl kickstart -k) up to 10s to free
# the port. If it's still held, abort instead of rebuild-poisoning a live
# server or looping on EADDRINUSE.
for _ in $(seq 1 10); do
  if ! lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then break; fi
  sleep 1
done
if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "$(date): port 3000 still in use after 10s, aborting" >> "$LOG"
  exit 1
fi

# Keep the newest 3 builds. The running instance (killed above) is the only
# consumer of old dirs, so pruning the oldest is safe after the port frees.
mkdir -p .builds
ls -1dt .builds/* 2>/dev/null | tail -n +4 | xargs -r rm -rf 2>/dev/null || true

BUILD_ID="$(date +%Y%m%d-%H%M%S)"
export NEXT_DIST_DIR=".builds/$BUILD_ID"

npm run build >> "$LOG" 2>&1

exec npm run start >> "$LOG" 2>&1