export PATH="/workspace/app/root-terminal/.local/terminal/.local/bin:/workspace/app/root-terminal/.local/terminal/.npm/bin:$PATH"
export PIP_TARGET=/workspace/app/root-terminal/.local/terminal/.pylibs
export PYTHONPATH=/workspace/app/root-terminal/.local/terminal/.pylibs:$PYTHONPATH
export NPM_CONFIG_PREFIX=/workspace/app/root-terminal/.local/terminal/.npm
stty -echo 2>/dev/null
# ROOTGUARD: keep session shell alive
exit(){ echo "⚠ الجلسة دائمة — للإيقاف استخدم زر ⏹"; }
logout(){ exit; }
install(){ local p="$1"; echo "[1/3] apt: $p..."; if apt-get install -y "$p" 2>/dev/null; then echo "$p" >> /workspace/app/root-terminal/.local/terminal/apt.txt; sort -u /workspace/app/root-terminal/.local/terminal/apt.txt -o /workspace/app/root-terminal/.local/terminal/apt.txt; echo "OK apt + saved"; return 0; fi; echo "[2/3] pip: $p..."; if pip install --quiet "$p" 2>&1 | tail -1; pip show "$p" >/dev/null 2>&1; then echo "OK pip (saved)"; return 0; fi; echo "[3/3] npm: $p..."; if npm i -g "$p" 2>&1 | tail -1; [ -x "/workspace/app/root-terminal/.local/terminal/.npm/bin/$p" ] || command -v "$p" >/dev/null; then echo "OK npm (saved)"; return 0; fi; echo "FAIL: not found"; return 1; }
