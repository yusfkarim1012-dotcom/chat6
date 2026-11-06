#!/bin/bash
# Supervisor — ensures the ROOT Terminal watchdog is ALWAYS running.
# If the watchdog dies, this restarts it. Never stops.
set -u
DIR="/workspace/app/root-terminal"
LOG="$DIR/supervisor.log"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG"; }

# Make sure deps exist before watchdog starts
ensure_deps() {
  command -v python3 >/dev/null 2>&1 || { apt-get update -qq && apt-get install -y -qq python3; }
  command -v lt >/dev/null 2>&1 || npm install -g localtunnel
  command -v cloudflared >/dev/null 2>&1 || {
    curl -sL -o /tmp/cf.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && dpkg -i /tmp/cf.deb
  }
}

log "supervisor started (pid $$)"
ensure_deps

while true; do
  if ! pgrep -f "watch.sh" >/dev/null 2>&1; then
    log "WATCHDOG DOWN — restarting"
    nohup bash "$DIR/watch.sh" >>"$LOG" 2>&1 &
  fi
  sleep 15
done