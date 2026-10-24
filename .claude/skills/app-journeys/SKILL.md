---
name: app-journeys
description: >-
  How this session uses the Livro-Caixa app for real, on the Android emulator of the developer's
  PC, through the Maestro MCP running in this container, against the Firebase emulators: starting
  the stack, resetting the test data, signing in as a test account, reading the screen, taking
  screenshots, checking a screen against the .pen design, what a journey is for (the developer
  testing by hand, redundant by definition) and what a bug it finds becomes, how to write the
  Maestro flow, and the counted round. Use whenever the task is to open the app,
  navigate it, check something on screen, take a screenshot of the app, or write or run the
  journeys. Triggers: "abre o app", "navega no app", "confere no emulador", "tira print do app",
  "roda as jornadas", "guarda esse caminho", "vira jornada", "Maestro", "jornada".
---

# App journeys

The Android emulator runs on the developer's PC: this container has no hardware acceleration.
Everything else runs here. The container shares the PC's network (`--network host` in the
claude-box launcher), so `localhost` here is the PC's: Maestro talks to the PC's adb server on
`localhost:5037`, and the app on the emulator reaches the stack on `10.0.2.2`, the PC's loopback.
Java, Maestro and the Android SDK's adb come from the PC: the claude-box mounts them and puts them
on the `PATH`, outside this repository. A missing one is the box's to fix: tell the person.

`journeys/maestro.sh` is the only way in:

- `mcp`: the Maestro MCP server, registered in this project as `maestro`;
- `test [flow | tag:<name>]`: the counted round (`pnpm journeys:test`).

Both prepare the emulator first (app drawing on, animations off: see the ATD trap below) and
export `MAESTRO_FIREBASE_PROJECT` for the flows. The MCP runs inside
`journeys/.local/captures/session/`, so a `takeScreenshot` from `run` lands there: give `run`
absolute paths.

## The stack

`pnpm journeys:stack` (`journeys/stack.sh`) starts the Firebase emulators and Metro, with
`EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true`. This session starts it in the background and waits for
"Pilha das jornadas de pé"; it refuses to start when one of its ports is taken, which means another
stack or another Metro is up. It needs:

- the Android emulator open on the PC: the `Livro_Caixa_API_35` AVD (Android 15, the
  `google_atd` image, Pixel 7 profile; Android 16 is a trap below). The person opens it;
  `adb devices` shows it.
- the debug APK installed on it. The debug build loads the JavaScript from Metro, so a JS change
  needs no new build: when the native code is unchanged, this session reinstalls the last build
  with `adb install -r apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`. A native
  change (a new native package, `app.json`) needs `pnpm android --no-bundler` on the PC: without
  the flag it leaves a Metro of its own on 8081, without the variable, and the stack refuses to
  start.
- `apps/mobile/google-services.json`: the emulators start with its project id, the one the app
  uses.

## Opening the session

1. `list_devices` must list the emulator. Only a failing call proves the MCP is down (the user's global rule):
   say what failed and ask, never guess what the screen shows.
2. Every exploration starts like a journey: reset the data, then sign in. With `run` and inline
   YAML:

   ```yaml
   appId: dev.leonardolf.livrocaixa
   ---
   - runScript: /home/leonardo/projects/pessoal/livro-caixa/journeys/scripts/resetData.js
   - runFlow:
       file: /home/leonardo/projects/pessoal/livro-caixa/journeys/subflows/signInAs.yaml
       env:
         LINK: ${output.accounts.member.signInLink}
   ```

   The accounts live only in `journeys/scripts/resetData.js`: `admin` (Ana Souza), `member` (Bruno
   Souza), `outsider` (Carla Lima, outside the allowed list). Signing in goes through the test link
   `livrocaixa://test-sign-in?email=…&name=…`, which only works with the app on the emulators
   (`TestSignInPage`).

## The tools

| Tool | For |
|---|---|
| `inspect_screen` | the view hierarchy: texts, accessibility labels, ids and bounds |
| `take_screenshot` | what the person sees; every image read goes linked in the answer |
| `run` | inline YAML or flow files: taps, typing, assertions, scripts |
| `cheat_sheet` | Maestro's commands and syntax, before writing an unfamiliar step |

Selectors, in this order: the visible text or the accessibility label (`text` also matches the
Android content description, so a `Button`'s `label` works), then a `testID` (`id:`) only where the
text changes from run to run. Never a position (`point`, `index`).

## Checking against the design

Put the screenshot next to the frame of the `.pen`, read with the `pencil` MCP (skill `design`).
Maestro has no computed style: colors, fonts and spacing are compared by eye on the screenshot and
against the values of the frame's nodes. Name each divergence with the node it differs from.

## What a journey is for

A journey is the developer testing by hand: open the app, explore, find and analyze bugs, and see
the app's state. It is redundant by definition: every check a journey makes also has a cheaper test,
in a page test, a contract test, a unit test or the rules test (skill `testing`, and the
documentation's "Testes" page). A journey is never the only test of a behavior.

- **A bug a journey finds** becomes, first, a failing test in the cheapest layer that reproduces it;
  then the fix; then the journey again, to see it on screen. Ex.: the no-access screen showing
  another person's e-mail is a page test with the session from a sign-in scenario.
- **A path worth replaying** is kept as a flow: a behavior change just made, a reported bug, a
  difference between profiles (admin, member, outsider), a path across screens, or the person asks
  for it ("guarda esse caminho"). Each check in it already has its cheaper test, or gets one in the
  same commit.
- **A check with no cheaper test is a missing test**: write it in the layer that proves it, instead
  of leaning on the journey.
- **A path that already has a flow** gets that flow updated, not a second one.
- **Only a person judges** how it feels to use (scroll, gestures, delays) and the screen against the
  design: it goes to a "só uma pessoa julga" list, not into a flow.
- **The emulators can't reproduce** the real Google sign-in: a person checks it.
- **Exploring** answers with the linked screenshot and needs no flow.

## Writing the journey

- One flow per file: `journeys/flows/<feature>/<goal>.yaml`, the goal in camelCase English
  (`outsiderSeesNoAccess.yaml`). `journeys/flows/config.yaml` picks up every subfolder.
- The flow's header comment, after the goal, has a `# Coberto por:` list: one line per check in the
  flow, with the tests that cover it. A review reads it to see the flow is redundant, and a change
  that moves or renames one of those tests updates the list in the same commit.

  ```yaml
  # Quem entra com um e-mail fora da lista vê o aviso com o próprio e-mail, e Sair volta ao login.
  # Coberto por:
  # - Carla em sem acesso: _layout.test.tsx e o contrato do allowedEmailQueryService (emailOutsideList).
  # - O e-mail dela no aviso: NoAccessPage.test.tsx, com a sessão do outsiderSignsIn.
  ```
- The first steps are always `runScript: ../../scripts/resetData.js` and the `signInAs` subflow:
  each flow starts from the same data, and `launchApp` with `clearState` drops the previous
  session.
- One assertion per state checked (`assertVisible`, `assertNotVisible`), then
  `takeScreenshot: <screen>--<state>`: Maestro saves it in the flow's own artifact folder and
  rejects a path outside it. Absence is proven with `assertNotVisible`, never by a missing step.
- A step that changes data mid-flow goes through a script in `journeys/scripts/`, reading
  `output.firestoreDocumentsUrl` (set by `resetData.js`) and writing as `Bearer owner`.
- Comments in pt-BR, identifiers and file names in English (`.claude/rules/code-language.md`).
- A journey goes in the same commit as the behavior it checks and the cheaper tests that cover it
  (skill `commit-convention`).

## The counted round

1. Try the flow with `run` in the session.
2. Run the round: `pnpm journeys:test [<flow path> | tag:<name>]`. A flow path runs that flow;
   `tag:<name>` runs the flows with that tag (`tags:` in the flow, one per feature: `auth`);
   nothing runs every flow. Day to day, run the flow or the tag that changed; every flow
   runs before the merge.
3. Each round gets `journeys/.local/captures/<YYYY-MM-DD-HHMMSS>/`, outside Git: `report.xml`, the
   JUnit report with each flow's time, and Maestro's session folder, with one folder per flow
   holding its `takeScreenshot/` captures, its `commands.json` (each step's duration) and its
   `logs/` (the device's logcat included). Delete old rounds when they pile up.
4. The flows run one after the other, never in shards: each one wipes the emulator's Firestore,
   and the app is one family per database, so two at once would erase each other's data. When the
   measured time of every flow passes about 30 minutes, bring it to the person: parallel runs need
   one stack per Android emulator.

Only a passing round lets the journey be committed. A failure that isn't clearly a defect of the
new code (a selector, a timing) is investigated with `inspect_screen` before changing the flow;
when it is unclear whether it is a regression, ask.

## Traps

- **Metro without the variable:** the test link sends back to sign-in, and the flow fails waiting
  for the next screen. The stack must have been started by `pnpm journeys:stack`, not by
  `pnpm mobile start`.
- **The Firebase emulators down:** sign-in shows the error toast and the flow fails. Restart the
  stack.
- **`clearState`** erases the session and the cached data: every flow signs in again.
- **A native change** needs `pnpm android` on the PC again; Metro alone won't bring it.
- **The first bundle** after `clearState` takes a while: the `signInAs` subflow waits up to 60 s
  for the sign-in screen.
- **The adb version:** use only the PC's adb, the one the claude-box puts on the `PATH`. A client
  of another version kills the PC's adb server and starts its own.
- **No device in `list_devices`:** the emulator is closed. Ask the person to open it.
- **Android 16 makes every tap take about 10 s.** `expo-splash-screen` holds the app's drawing
  until `SplashScreen.hide()`; Android 16 waits only 2 s for a drawn frame to hand the splash over,
  gives up, and leaves the app's window in an animation that never ends. Every injected tap waits
  for it (`Timed out waiting for animations to complete` and `transferring splash screen timeout`
  in the logcat). People don't notice, since a real touch doesn't wait. Android 15 doesn't have
  this path: keep the journeys on the `Livro_Caixa_API_35` AVD.
- **The ATD image boots with app drawing off** (`debug.hwui.drawing_enabled=0`), and has no
  SystemUI: no status or navigation bar, no system splash, an empty black home. Apps run, the view
  hierarchy is full and the assertions pass, but every window stays black, screenshots and the
  person's emulator window included (the window freezes on the boot animation's last frame).
  `journeys/maestro.sh` and `pnpm android` (`scripts/android.sh`) set the property back to 1, which
  lasts until the next boot and reaches only app processes started after it. When the emulator was
  opened after the MCP or after `pnpm android`: `adb shell setprop debug.hwui.drawing_enabled 1`,
  then relaunch the app; no root and no framework restart needed. A black screenshot over a full
  hierarchy is this.
- **A round takes the device from the MCP.** `pnpm journeys:test` starts Maestro's driver on the
  emulator over the MCP's, and the MCP keeps the dead connection: every call fails with "Device
  server died" until the person reconnects it (`/mcp`). Explore first, run the round last, or ask
  for the reconnect.
