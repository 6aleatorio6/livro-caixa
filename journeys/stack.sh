#!/usr/bin/env bash
# A pilha das jornadas, neste container: os emuladores do Firebase e o Metro servindo o app apontado
# para eles. O app, no emulador do Android do PC, chega aos dois por 10.0.2.2, o localhost do PC, que
# este container divide. O Java dos emuladores chega no PATH pelo claude-box.
set -euo pipefail
REPO=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO"

GOOGLE_SERVICES="apps/mobile/google-services.json"
if [ ! -f "$GOOGLE_SERVICES" ]; then
  echo "Falta o $GOOGLE_SERVICES: os emuladores e as jornadas usam o projeto do app." >&2
  exit 1
fi
FIREBASE_PROJECT=$(node -p "require('./$GOOGLE_SERVICES').project_info.project_id")

isPortTaken() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

for port in 4001 8080 8081 9099 9199; do
  if isPortTaken "$port"; then
    echo "A porta $port já está ocupada: outra pilha ou outro Metro está de pé." >&2
    exit 1
  fi
done

# Se um dos dois cair, o outro cai junto.
trap 'kill 0' EXIT
firebase emulators:start --project "$FIREBASE_PROJECT" &
emulators=$!
# Sem `CI=1`: no modo CI, o Expo CLI desliga o watch do Metro, e o app no emulador seguiria com o
# código de quando a pilha subiu. Em segundo plano, sem terminal, ele já roda sem perguntas.
EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true pnpm mobile start --clear &
metro=$!

for port in 8080 8081 9099 9199; do
  until isPortTaken "$port"; do
    # Sem isto, um emulador ou um Metro que morre na subida (sem Java, por exemplo) deixa o loop eterno.
    # Um kill -0 por processo: com os dois juntos, ele dá certo se um só estiver vivo.
    for pid in "$emulators" "$metro"; do
      kill -0 "$pid" 2>/dev/null || { echo "A pilha caiu antes de subir." >&2; exit 1; }
    done
    sleep 1
  done
done
echo "Pilha das jornadas de pé: projeto $FIREBASE_PROJECT, Metro na 8081."
wait -n
