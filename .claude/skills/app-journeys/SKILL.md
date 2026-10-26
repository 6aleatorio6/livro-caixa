---
name: app-journeys
description: >-
  How this session uses the Livro-Caixa app for real, on the Android emulator of the developer's
  PC, through Maestro's CLI and adb from this container, against the Firebase emulators: starting
  the stack, the test data, signing in as a test account, reading the screen in dp, taking
  screenshots, checking a screen against the .pen design, what a journey is for (the developer
  testing by hand, redundant by definition) and what a bug it finds becomes, how to write the
  Maestro flow, and the counted round. Use whenever the task is to open the app, navigate it, check
  something on screen, take a screenshot of the app, or write or run the journeys. Triggers: "abre
  o app", "navega no app", "confere no emulador", "tira print do app", "roda as jornadas", "guarda
  esse caminho", "vira jornada", "Maestro", "jornada".
allowed-tools: Bash(pnpm journeys:test *) Bash(pnpm journeys:inspect *) Bash(adb devices) Bash(adb exec-out screencap *)
---

# App journeys

The Android emulator runs on the developer's PC: this container has no hardware acceleration.
Everything else runs here. The container shares the PC's network (`--network host` in the
claude-box launcher), so `localhost` here is the PC's: Maestro and adb talk to the PC's adb server
on `localhost:5037`, and the app on the emulator reaches the stack on `10.0.2.2`, the PC's loopback.
Java, Maestro and the Android SDK's adb come from the PC: the claude-box mounts them and puts them
on the `PATH`, outside this repository. A missing one is the box's to fix: tell the person.

Three commands, all from the repository root:

- `pnpm journeys:stack` (`journeys/stack.sh`): the stack.
- `pnpm journeys:test [<flow> | tag:<name>]` (`journeys/test.ts`): prepares the emulator (app
  drawing on, animations off: see the ATD trap), deletes old rounds, serves the test data and runs
  Maestro.
- `pnpm journeys:inspect [<selector>…]` (`journeys/inspect.ts`): the screen's nodes, in dp.

Where each file goes, and when something becomes a step or a scenario: `journeys/CLAUDE.md`.

## The stack

`pnpm journeys:stack` starts the Firebase emulators and Metro, with
`EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true`. This session starts it in the background and waits for
"Pilha das jornadas de pé"; it refuses to start when one of its ports is taken, which means another
stack or another Metro is up: never take it down. It needs:

- the Android emulator open on the PC: the `Livro_Caixa_API_35` AVD (Android 15, the default
  image without Google Play, Pixel 7 profile at density 420; Android 16 is a trap below). It has
  the status and navigation bars, so `adb exec-out screencap -p` and Maestro's `takeScreenshot`
  show them. The person opens it; `adb devices` shows it.
- the debug APK installed on it. The debug build loads the JavaScript from Metro, so a JS change
  needs no new build: when the native code is unchanged, this session reinstalls the last build
  with `adb install -r apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`. A native
  change (a new native package, `app.json`) needs `pnpm android --no-bundler` on the PC: without
  the flag it leaves a Metro of its own on 8081, without the variable, and the stack refuses to
  start.
- `apps/mobile/google-services.json`: the emulators start with its project id, the one the app
  uses.

## Using the app

1. `adb devices` lists `emulator-5554`. No device: ask the person to open the AVD.
2. Check that no other round is running: one device and one Firestore serve every session, and
   each flow wipes the data. `adb shell ps -A | grep dev.mobile.maestro` prints the Maestro driver
   only while a round runs: at the end, Maestro uninstalls it, which also frees `uiautomator` for
   `pnpm journeys:inspect`. A run with `--no-reinstall-driver` skips that uninstall and leaves the
   driver holding `uiautomator`, so `journeys:test` never passes it.
3. Every exploration starts like a journey, from a throwaway flow in `journeys/.local/explore/`
   (outside Git), which reaches `journeys/` by the same `../../` as a flow in `flows/`:

   ```yaml
   appId: dev.leonardolf.livrocaixa
   ---
   - runFlow:
       file: ../../steps/startAs.yaml
       env:
         PROFILE: member
   - tapOn: Configurações
   ```

   `pnpm journeys:test journeys/.local/explore/<name>.yaml` runs it (about 26 s). A flow outside
   `flows/` is not a counted round: it goes to `captures/explore/`. The app stays on the screen where the flow stopped, so the next step is
   another throwaway flow without `startAs` or `launchApp`, which goes on from there (about 12 s).
   `startAs` takes `admin` (Ana Souza), `member` (Bruno Souza) or `outsider` (Carla Lima, outside
   the allowed list); the accounts live only in `journeys/data/accounts.ts`.
4. Read the screen with `pnpm journeys:inspect <selector>…`: one line per matching node, with its
   text, accessibility label, id, size and position in dp, center and states (clickable, selected,
   disabled). The selector works like a flow's: text (a full regex, or literal when it isn't one)
   matches the text or the accessibility label; `id:<regex>` matches the resource id. With no
   selector, every node with a text, label or id.
5. Only when color or composition matter:
   `adb exec-out screencap -p > journeys/.local/captures/screen/<name>.png`. Every image read goes
   linked in the answer.

Selectors in a flow, in this order: the visible text or the accessibility label (`text` also
matches the Android content description, so a `Button`'s `label` works), then a `testID` (`id:`)
only where the text changes from run to run. Never a position (`point`, `index`). Before running an
unfamiliar step, `maestro check-syntax <flow>` checks it, and the `context7` skill has Maestro's
commands.

## No Maestro MCP

This project has no Maestro MCP, on purpose; don't register one. Every round starts Maestro's
driver over the MCP's, which then answers "Device server died" until someone reconnects it, and a
build that runs unattended has nobody to do that. Its `inspect_screen` brings the whole hierarchy
into the conversation (30 KB on Configurações) and `take_screenshot` an image per call. And an MCP
is only ever called by the AI: there is no person to keep it for.

## Checking against the design

Put the screenshot next to the frame of the `.pen`, read with the `pencil` MCP (skill `design`).
React Native has no computed style: sizes and positions come from `pnpm journeys:inspect`, in dp,
next to the frame's values; colors are compared on the screenshot. Name each divergence with the
node it differs from.

## What a journey is for

A journey is the developer testing by hand: open the app, explore, find and analyze bugs, and see
the app's state. It is redundant by definition: every check a journey makes also has a cheaper test,
in a page test, a contract test, a unit test or the rules test (skill `testing`, and the
documentation's "Testes" page). A journey is never the only test of a behavior.

- **A bug a journey finds** becomes, first, a failing test in the cheapest layer that reproduces it;
  then the fix; then the journey again, to see it on screen. Ex.: the no-access screen showing
  another person's e-mail is a page test with the session from a sign-in scenario.
- **A flow comes out of an exploration, never out of a plan.** A plan schedules the exploration of
  the paths a change touches (the profiles, the states, the screens it crosses) and asks for its
  findings; it doesn't list flows to write, and a plan's coverage table doesn't count a flow. A flow
  written from the plan's text has no one looking at the screen: in G2 the "Remover" flow tapped
  another person's button and passed.
- **After exploring, a path is kept as a flow** when the exploration found something on it (a bug, a
  difference between profiles worth replaying), when the check only runs on the device, or when the
  person asks for it ("guarda esse caminho"). A behavior change by itself is no reason: its checks
  already have cheaper tests. Each check in a kept flow already has its cheaper test, or gets one in
  the same commit.
- **A check with no cheaper test is a missing test**: write it in the layer that proves it, instead
  of leaning on the journey. The exception is what only the device runs (the app's JS engine,
  Hermes, which Jest doesn't use; a native picker): that check is the flow's own, and its
  `# Coberto por:` line says so.
- **A path that already has a flow** gets that flow updated, not a second one.
- **Only a person judges** how it feels to use (scroll, gestures, delays) and the screen against the
  design: it goes to a "só uma pessoa julga" list, not into a flow.
- **The emulators can't reproduce** the real Google sign-in: a person checks it.
- **Exploring** answers with the linked screenshot or the `inspect` lines and needs no flow.

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
- The first step is always `steps/startAs.yaml` with the `PROFILE`: each flow starts from the same
  data, and its `launchApp` with `clearState` drops the previous session. Switching accounts mid-flow
  is `steps/signInAs.yaml` with the `LINK` (`${output.accounts.<profile>.signInLink}`), which keeps
  the data.
- Data that changes mid-flow, as someone outside the app would change it, is a scenario of
  `journeys/data/scenarios.ts`, asked for by `data/request.js`:

  ```yaml
  - runScript:
      file: ../../data/request.js
      env:
        SCENARIO: removeAdmin
        EMAIL: ${output.accounts.admin.email}
  ```

  A new kind of data (a screen's seed with the design's names and values) is a new scenario in
  TypeScript, never a loose `.js`: Maestro's `runScript` has no Node and no `import`. A new
  parameter goes into `ScenarioParams` and into `data/request.js`. `pnpm typecheck:journeys`
  checks the TypeScript.
- One assertion per state checked (`assertVisible`, `assertNotVisible`), then
  `takeScreenshot: <screen>--<state>`: Maestro saves it in the flow's own artifact folder and
  rejects a path outside it. Absence is proven with `assertNotVisible`, never by a missing step.
- Comments in pt-BR, identifiers and file names in English (`.claude/rules/code-language.md`).
- A journey goes in the same commit as the behavior it checks and the cheaper tests that cover it
  (skill `commit-convention`).

## The counted round

1. Build the path in throwaway flows; then write the flow in `flows/<feature>/`.
2. Run the round: `pnpm journeys:test [<flow path> | tag:<name>]`. A flow path runs that flow;
   `tag:<name>` runs the flows with that tag (`tags:` in the flow, one per feature: `auth`);
   nothing runs every flow. Day to day, run the flow or the tag that changed; every flow
   runs before the merge.
3. Each round gets `journeys/.local/captures/<YYYY-MM-DD-HHMMSS>/`, outside Git: `report.xml`, the
   JUnit report with each flow's time, and Maestro's session folder, with one folder per flow
   holding its `takeScreenshot/` captures, its `commands.json` (each step's duration) and its
   `logs/` (the device's logcat included). Each round deletes the old ones (what it keeps:
   `journeys/CLAUDE.md`); copy what a report must keep into a folder of its own.
4. The flows run one after the other, never in shards: each one wipes the emulator's Firestore,
   and the app is one family per database, so two at once would erase each other's data. When the
   measured time of every flow passes about 30 minutes, bring it to the person: parallel runs need
   one stack per Android emulator.

Only a passing round lets the journey be committed. A failure that isn't clearly a defect of the
new code (a selector, a timing) is investigated with `pnpm journeys:inspect` and the round's
`commands.json` before changing the flow; when it is unclear whether it is a regression, ask.

A failed round is read before it is rerun: the failing step in `report.xml`, the data server's
warnings and `firestore-debug.log`. A scenario that fails (a 500 from the data server) is a harness
defect to fix, never a rerun until green: in G3, two rounds reran past one hid a screen stuck in
error and a toast that the app shows to real people too.

`assertNoErrors` sees only the end of a flow, and a toast lasts seconds. An error toast or error
state seen anywhere in a round's captures, or by the person watching the device, is reproduced in a
throwaway flow before the round counts as passing.

## Traps

- **Metro without the variable:** the test link sends back to sign-in, and the flow fails waiting
  for the next screen. The stack must have been started by `pnpm journeys:stack`, not by
  `pnpm mobile start`.
- **The Firebase emulators down:** sign-in shows the error toast and the flow fails. Restart the
  stack. After a few hours the stack can fall by itself (`Error: An unexpected error has occurred`
  in its log, twice in G4, once right after a `touch` of the rules) and leave the Firestore Java on
  8080: kill that process, then `pnpm journeys:stack` again.
- **Metro serves an old bundle after a rebase** (the rebase rewrites the app's files one commit at a
  time, and Metro bundles one of the intermediate states: "Unable to resolve …" in the stack log, a
  Render Error on the device that the code at `HEAD` can't produce). Restart the stack after every
  rebase, before a round.
- **The emulator loses its network** (`wlan0` NO-CARRIER, `ping 10.0.2.2` says "Network is
  unreachable"; Firestore fails with ENETUNREACH; twice in G4). Toggling wifi or airplane
  mode doesn't bring the virtual AP back; `adb reboot` does, without the person. Wait for
  `sys.boot_completed`, then redo `adb reverse tcp:8081 tcp:8081` (the reboot drops it, and the app
  shows "Unable to load script") and `debug.hwui.drawing_enabled` (below).
- **Port 4020 taken:** `pnpm journeys:test` serves the test data there and refuses to start; another
  round is running.
- **"Unable to load script" after the emulator was opened again:** a new boot drops the
  `adb reverse` that `pnpm android` set, and `signInAs` fails waiting for "Entrar com Google".
  `adb reverse tcp:8081 tcp:8081`, then the flow again.
- **The file picker's files live only on the device.** `home/memberPaysRecurringBill` picks
  `recibo-pequeno.pdf` (one page: the app refuses a PDF of more) and
  `payments/memberRegistersOneOffBillWithReducedReceipt` picks `foto-grande.jpg` (over 900 KB) from
  Downloads; a new AVD or image has none, and the flows fail on "Element not found". Rebuild them
  from `data/fixtures/` (a copy of `pix-agua-outubro.pdf`; `recibo-conserto.jpg` with JPEG comment
  segments, `FF FE`, after the `FF D8`, to 22 MB), then `adb push` each to `/sdcard/Download/` and
  send `MEDIA_SCANNER_SCAN_FILE` for it.
- **The status and navigation bars take height:** a list item near the end of the Início (the
  Água) sits below the fold. Wait for the first item, or scroll to the one the flow needs.
- **`clearState`** erases the session and the cached data: every flow signs in again.
- **A native change** needs `pnpm android` on the PC again; Metro alone won't bring it.
- **The first bundle** after `clearState` takes a while: `signInAs` waits up to 60 s for the
  sign-in screen.
- **The adb version:** use only the PC's adb, the one the claude-box puts on the `PATH`. A client
  of another version kills the PC's adb server and starts its own.
- **Android 16 makes every tap take about 10 s.** `expo-splash-screen` holds the app's drawing
  until `SplashScreen.hide()`; Android 16 waits only 2 s for a drawn frame to hand the splash over,
  gives up, and leaves the app's window in an animation that never ends. Every injected tap waits
  for it (`Timed out waiting for animations to complete` and `transferring splash screen timeout`
  in the logcat). People don't notice, since a real touch doesn't wait. Android 15 doesn't have
  this path: keep the journeys on the `Livro_Caixa_API_35` AVD.
- **A density override** (`adb shell wm density` printing an `Override density` next to the
  physical 420) makes the screen narrower in dp than the design's 411, so every comparison with
  the `.pen` drifts and everything looks oversized. `adb shell wm density reset`, then relaunch
  the app.
- **The ATD image** (`google_atd`, the AVD's image until 2026-10-25) **boots with app drawing off**
  (`debug.hwui.drawing_enabled=0`), and has no
  SystemUI: no status or navigation bar, no system splash, an empty black home. Apps run, the view
  hierarchy is full and the assertions pass, but every window stays black, screenshots and the
  person's emulator window included (the window freezes on the boot animation's last frame).
  `pnpm journeys:test` and `pnpm android` (`scripts/android.sh`) set the property back to 1, which
  lasts until the next boot and reaches only app processes started after it. When the emulator was
  opened after the last round or after `pnpm android`: `adb shell setprop debug.hwui.drawing_enabled
  1`, then relaunch the app; no root and no framework restart needed. A black screenshot over a full
  hierarchy is this, or the next trap.
- **A session left from an earlier stack holds the splash forever.** The Auth emulator starts
  empty, so a session the app kept has an invalid refresh token (`INVALID_REFRESH_TOKEN` in the
  logcat). Firestore retries `UNAUTHENTICATED` without ever failing, `useAccess` stays `loading`,
  and `SplashScreen.hide()` never runs: black on ATD, the splash elsewhere. The sign-in page sits
  in the hierarchy all the while, since its guard also takes `loading`. `adb shell dumpsys activity
  top` names the culprit: `mLastPerformTraversalsFailedReason=predraw_expo.modules.splashscreen…`.
  The flows don't hit it (`clearState`); by hand, `adb shell pm clear dev.leonardolf.livrocaixa`.
