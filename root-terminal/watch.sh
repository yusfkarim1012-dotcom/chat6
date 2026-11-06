#!/bin/bash
# ROOT Terminal watchdog — self-healing, auto-installs deps, keeps server + tunnel alive.
# Writes a VERIFIED working public URL to /workspace/app/root-terminal/url.txt
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
export TERM_PASS="${TERM_PASS:-root1234}"
export TERM_USER="${TERM_USER:-yusf}"
export PORT="${PORT:-7682}"
LOG="$DIR/term.log"
URLFILE="$DIR/url.txt"
BYPASS="abypass-tunnel-reminder: 1"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG"; }

# Kill any stale instances from previous runs
pkill -f "cloudflared tunnel" 2>/dev/null
pkill -f "lt --port" 2>/dev/null
pkill -f "python3 $DIR/app.py" 2>/dev/null
sleep 1

ensure_python() {
  command -v python3 >/dev/null 2>&1 && return 0
  log "installing python3"
  apt-get update -qq && apt-get install -y -qq python3 2>&1 | tail -1
  command -v python3 >/dev/null 2>&1
}

ensure_lt() {
  command -v lt >/dev/null 2>&1 && return 0
  log "installing localtunnel"
  npm install -g localtunnel 2>&1 | tail -1
  command -v lt >/dev/null 2>&1
}

ensure_cloudflared() {
  command -v cloudflared >/dev/null 2>&1 && return 0
  log "installing cloudflared"
  curl -sL -o /tmp/cf.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && dpkg -i /tmp/cf.deb 2>&1 | tail -1
  command -v cloudflared >/dev/null 2>&1
}

start_server() {
  if curl -s --connect-timeout 2 "http://localhost:$PORT/manifest.json" >/dev/null 2>&1; then
    log "server already up"; return 0
  fi
  cd "$DIR"
  nohup env TERM_PASS="$TERM_PASS" TERM_USER="$TERM_USER" PORT="$PORT" python3 app.py >>"$LOG" 2>&1 &
  log "server started pid $!"
}

start_tunnel() {
  cd "$DIR"
  rm -f "$URLFILE"
  # Try localtunnel first (more reliable in sandboxed envs)
  nohup lt --port "$PORT" >>"$LOG" 2>&1 &
  local pid=$!
  for i in $(seq 1 30); do
    sleep 1
    cand=$(grep -oE 'https://[a-zA-Z0-9-]+\.loca\.lt' "$LOG" | tail -1)
    if [ -n "$cand" ] && curl -s --connect-timeout 10 -H "$BYPASS" "$cand/manifest.json" | grep -q "ROOT Terminal"; then
      echo "$cand" > "$URLFILE"
      log "tunnel verified (lt) url=$cand"
      return 0
    fi
  done
  log "lt failed, trying cloudflared"
  pkill -f "lt --port" 2>/dev/null
  nohup env GODEBUG=netdns=cgo cloudflared tunnel --url "http://localhost:$PORT" --retries 10 >>"$LOG" 2>&1 &
  for i in $(seq 1 30); do
    sleep 1
    cand=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" | tail -1)
    if [ -n "$cand" ] && curl -s --connect-timeout 10 "$cand/manifest.json" | grep -q "ROOT Terminal"; then
      echo "$cand" > "$URLFILE"
      log "tunnel verified (cf) url=$cand"
      return 0
    fi
  done
  log "tunnel started pid $pid (URL pending verification)"
}

ensure_python && ensure_lt && ensure_cloudflared
start_server
sleep 1
start_tunnel
log "watchdog running — logs: $LOG"

while true; do
  sleep 10
  if ! curl -s --connect-timeout 2 "http://localhost:$PORT/manifest.json" >/dev/null 2>&1; then
    log "SERVER DOWN — restarting"
    start_server
  fi
  if ! pgrep -f "lt --port" >/dev/null 2>&1 && ! pgrep -f "cloudflared tunnel" >/dev/null 2>&1; then
    log "TUNNEL DOWN — restarting"
    start_tunnel
  fi
  cur=$(cat "$URLFILE" 2>/dev/null)
  if [ -n "$cur" ] && ! curl -s --connect-timeout 10 -H "$BYPASS" "$cur/manifest.json" | grep -q "ROOT Terminal"; then
    log "PUBLIC URL STALE — refreshing"
    start_tunnel
  fi
done