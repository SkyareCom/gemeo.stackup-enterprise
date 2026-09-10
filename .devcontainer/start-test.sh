#!/usr/bin/env bash
set -euo pipefail

PORT="4173"
ROOT="${CODESPACE_VSCODE_FOLDER:-$(pwd)}"
LOG="/tmp/stackup-enterprise-test.log"
PIDFILE="/tmp/stackup-enterprise-test.pid"

cd "$ROOT"

if command -v python3 >/dev/null 2>&1; then
  PYTHON="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON="python"
else
  echo "Python não encontrado no Codespace." >&2
  exit 1
fi

if [ -f "$PIDFILE" ]; then
  OLD_PID="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "STACKUP TEST já está ativo na porta $PORT (PID $OLD_PID)."
    exit 0
  fi
fi

if command -v lsof >/dev/null 2>&1 && lsof -iTCP:"$PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "A porta $PORT já está em uso; mantendo o processo existente."
  exit 0
fi

nohup "$PYTHON" -m http.server "$PORT" --bind 0.0.0.0 >"$LOG" 2>&1 &
PID=$!
echo "$PID" > "$PIDFILE"
sleep 1

if kill -0 "$PID" 2>/dev/null; then
  echo "STACKUP ENTERPRISE TEST ativo na porta $PORT (PID $PID)."
  echo "Log: $LOG"
else
  echo "Falha ao iniciar o servidor de teste. Veja $LOG" >&2
  exit 1
fi
