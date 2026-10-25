# Where each file of the journeys goes

**The journeys live in `flows/<feature>/`, the screen steps they share in `steps/`, the test data
in `data/`, and everything generated in `.local/`.** The root holds only the three commands and
the configuration. How to run and write the journeys is in the `app-journeys` skill.

```
journeys/
  CLAUDE.md                this file
  package.json             only "type": "module", so Node and tsc read the .ts files as ES modules
  tsconfig.json            pnpm typecheck:journeys: test.ts, inspect.ts and data/
  stack.sh                 pnpm journeys:stack: the Firebase emulators and Metro
  test.ts                  pnpm journeys:test: prepares the emulator, deletes old rounds, serves
                           the test data and runs Maestro
  inspect.ts               pnpm journeys:inspect: the screen's nodes, in dp, through adb
  flows/                   the journeys: only journeys (config.yaml runs every */*)
    config.yaml
    <feature>/<goal>.yaml  one journey per file
  steps/                   screen steps that several flows run (runFlow)
    startAs.yaml           resets the data and signs in as the PROFILE: every flow starts here
    signInAs.yaml          only signs in, with a LINK: switching accounts mid-flow
  data/                    the test data in the emulator's Firestore
    server.ts              the HTTP server test.ts runs during the round, on port 4020; it receives the
                           Storage emulator's port and the app's bucket from test.ts
    scenarios.ts           the scenarios a flow asks for by name: reset, allowEmail, removeEmail…
    accounts.ts            the test accounts (Ana, Bruno, Carla) and their sign-in link
    firestore.ts           the emulator's Firestore and Storage as the project owner
                           (@firebase/rules-unit-testing): deleteAll, putObject
    share.ts               shareFixture: pushes a fixture to the phone's Downloads and shares it with the
                           app through adb (the shareReceipt scenario)
    fixtures/              the small committed files scenarios read: the ones a scenario puts in the
                           Storage emulator (comprovante-luz.pdf, recibo-conserto.jpg) and the ones
                           shareFixture pushes to the phone (pix-agua-outubro.pdf)
    request.js             the Maestro side (runScript): asks for a scenario, copies the answer to output
  .local/                  (outside Git)
    explore/               throwaway flows, run like any other
    captures/<round>/      the newest 5 counted rounds: report.xml, commands.json, logs, captures
    captures/explore/      the newest 5 rounds of throwaway flows
    captures/screen/       the newest 20 adb screencaps
    design/, conferencia-*/, stack.log   kept by the visual conference and the detached stack
```

| What it is | Where |
| --- | --- |
| A journey | `flows/<feature>/<goal>.yaml`, the feature as a camelCase folder (`allowedEmails`) |
| A sequence of screen steps that two or more flows repeat and that must change together in all of them | `steps/<what it does>.yaml` |
| A navigation shortcut (open a screen) | written in the flow, not a step |
| Data a flow needs: a reset, a change mid-flow, a screen's seed | a scenario in `data/scenarios.ts`; a new parameter also in `data/request.js` |
| A file a scenario needs in the Storage (a receipt) | `data/fixtures/`; the scenario writes it with `putObject` |
| A file a flow shares with the app, as another Android app would | `data/fixtures/`; the `shareReceipt` scenario (`data/share.ts`) pushes it to the phone and runs the `SEND` through adb, because Maestro has no shell |
| A tool run from the terminal | a `.ts` at the root with its `pnpm journeys:*` script |
| A throwaway flow | `.local/explore/` |
| Anything a round or a tool writes | `.local/`, configured to land there |

**Why:** the names say what each folder holds, not which Maestro command calls it — "scripts"
used to mean both the data and the terminal tools. Maestro's own layout (flows by feature, reusable
flows apart) is kept; the data follows Bluesky's `__e2e__`: Maestro's `runScript` runs in an engine
of its own, with no Node, no `import` and no TypeScript, so the logic lives in a Node server and the
flow only names the scenario. The `.local/` folder gathers what is generated, so the root shows
only content.

**How to apply:**

- **Nothing inside `flows/` but journeys**: the `*/*` of `config.yaml` would run it as one.
- **A step earns its file** when it is a sequence of screen actions that several flows share and
  that must change in one place (signing in, with its 60 s wait for the first bundle). A step hides
  what the flow does, so a shortcut stays in the flow.
- **No loose `.js` for data.** A new kind of data is a scenario, typed, written with the Firebase
  SDK (`setDoc`, `updateDoc`…) on the database the scenario receives; the only JavaScript Maestro
  runs is `data/request.js`.
- **A receipt a scenario writes is a real object in the Storage emulator**, put with
  `OwnerFirestore.putObject` (path, bytes, content type and `uploadedBy`) next to the entry that
  points to it, so the app downloads it as it would in production. The fixture is a file of
  `data/fixtures/`, never bytes inline. `deleteAll` (the `reset`) deletes the objects under `files/`
  by listing the folder, because `environment.clearStorage()` lists only the bucket root and
  would leave a receipt another flow uploaded behind (checked on the emulator).
  `test.ts` gives the data server the Storage port (from
  `firebase.json`) and the bucket (`storage_bucket` of `google-services.json`).
- **Nothing new loose at the root.** A new tool or configuration file enters the tree above.
