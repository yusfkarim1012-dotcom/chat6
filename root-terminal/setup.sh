#!/bin/bash
# ROOT Terminal — one-shot setup
# Installs all dependencies and starts the self-healing watchdog.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[1/5] Installing python3..."
if ! command -v python3 >/dev/null 2>&1; then
  apt-get update -qq && apt-get install -y -qq python3
fi
python3 --version

echo "[2/5] Installing localtunnel..."
if ! command -t lt >/dev/null 2>&1; then
  npm install -g localtunnel 2>&1 | tail -1
fi
lt --version 2>/dev/null || true

echo "[3/5] Installing cloudflared (fallback)..."
if ! command -v cloudflared >/dev/null 2>&1; then
  curl -sL -o /tmp/cf.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && dpkg -i /tmp/cf.deb 2>&1 | tail -1
fi
cloudflared --version 2>/dev/null || true

echo "[4/5] Starting ROOT Terminal server + watchdog..."
chmod +x "$DIR/watch.sh"
nohup bash "$DIR/watch.sh" >/dev/null 2>&1 &
echo "watchdog pid $!"

echo "[5/5] Waiting for public URL..."
for i in $(seq 1 30); do
  sleep 1
  [ -f "$DIR/url.txt" ] && { echo "URL: $(cat "$DIR/url.txt")"; break; }
done

echo ""
echo "ROOT Terminal is running."
echo "Local:  http://localhost:7682"
echo "Public: $(cat "$DIR/url.txt" 2>/dev/null || echo 'pending...')"
echo "Login:  user=yusf  pass=root1234"
echo "Logs:   $DIR/term.log"
echo ""
echo "To stop:  pkill -f watch.sh ; pkill -f app.py"