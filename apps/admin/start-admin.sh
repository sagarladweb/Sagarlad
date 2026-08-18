#!/bin/bash
# Persistent admin panel server for the Sagar Lad demo.
# Owned & managed by launchd (see ~/Library/LaunchAgents/com.sagarlad.admin.plist).
# Serves the production build on port 3001.
set -euo pipefail

cd /Users/karandhiver/Developer/Sagarlad/demo/apps/admin
export PATH="/Users/karandhiver/.hermes/node/bin:/usr/local/bin:$PATH"
LOG=/tmp/sagarlad-admin.log

for _ in $(seq 1 10); do
  if ! lsof -nP -iTCP:3001 -sTCP:LISTEN >/dev/null 2>&1; then break; fi
  sleep 1
done
if lsof -nP -iTCP:3001 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "$(date): port 3001 still in use after 10s, aborting" >> "$LOG"
  exit 1
fi

npm run build >> "$LOG" 2>&1

exec npm run start >> "$LOG" 2>&1