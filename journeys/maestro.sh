#!/usr/bin/env bash
# O Maestro das jornadas: `mcp` abre o MCP dele, registrado nesta pasta como `maestro`, e
# `test [fluxo | tag:<nome>]` é a rodada que conta, com as capturas e o JUnit numa pasta por rodada.
set -euo pipefail
source "$(dirname "$0")/env.sh"

captures="$REPO/journeys/.local/captures"

# Liga o desenho dos apps, que a imagem ATD desliga a cada boot: sem ele, a tela e toda captura saem
# pretas. Vale para o app aberto depois daqui, e os fluxos o reabrem com `clearState`. E desliga as
# animações: cada transição de tela pesa em todo fluxo. Sem o emulador aberto, só avisa: o MCP sobe do
# mesmo jeito.
# O -n deixa a entrada em paz: sem ele, o adb come a primeira mensagem que o cliente do MCP manda.
prepareEmulator() {
  local commands="setprop debug.hwui.drawing_enabled 1; "
  for setting in window_animation_scale transition_animation_scale animator_duration_scale; do
    commands+="settings put global $setting 0; "
  done
  adb shell -n "$commands" > /dev/null 2>&1 || echo "Emulador não preparado: ele está aberto?" >&2
}

case "${1:-}" in
  mcp)
    # O `takeScreenshot` pelo MCP grava na pasta de trabalho dele: as capturas da sessão ficam aqui, e
    # não na raiz do repositório.
    mkdir -p "$captures/session"
    cd "$captures/session"
    prepareEmulator
    exec maestro mcp
    ;;
  test)
    selection=("$REPO/journeys/flows")
    case "${2:-}" in
      "") ;;
      tag:*) selection=("--include-tags=${2#tag:}" "$REPO/journeys/flows") ;;
      *) selection=("$2") ;;
    esac
    # O Maestro grava cada `takeScreenshot` em <rodada>/<sessão>/<fluxo>/takeScreenshot/ e recusa
    # caminho fora dali: os fluxos dão só o nome da captura.
    round="$captures/$(date +%Y-%m-%d-%H%M%S)"
    mkdir -p "$round"
    prepareEmulator
    # O JUnit guarda o tempo de cada fluxo: é o que decide quando a suíte precisa rodar em paralelo.
    exec maestro test --test-output-dir "$round" \
      --format junit --output "$round/report.xml" "${selection[@]}"
    ;;
  *)
    echo "Uso: journeys/maestro.sh mcp | test [fluxo | tag:<nome>]" >&2
    exit 1
    ;;
esac
