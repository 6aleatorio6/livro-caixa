# Lido pelo `stack.sh` e pelo `maestro.sh`: o projeto Firebase do app. O Java, o Maestro e o adb
# chegam no PATH pelo claude-box; o adb conversa com o servidor do adb do PC, no localhost que o
# container divide com ele (`--network host`).

REPO=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

GOOGLE_SERVICES="$REPO/apps/mobile/google-services.json"
if [ ! -f "$GOOGLE_SERVICES" ]; then
  echo "Falta o $GOOGLE_SERVICES: os emuladores e as jornadas usam o projeto do app." >&2
  exit 1
fi
FIREBASE_PROJECT=$(node -p "require('$GOOGLE_SERVICES').project_info.project_id")
# O Maestro lê sozinho as variáveis que começam com MAESTRO_: o `resetData.js` usa esta.
export MAESTRO_FIREBASE_PROJECT="$FIREBASE_PROJECT"
