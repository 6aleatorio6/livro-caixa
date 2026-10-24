# Livro-Caixa

A mobile app to manage one family's finances. The brainstorm is still writing its documentation.

A pnpm monorepo with the documentation (the Markdown in `docs/` and the Docusaurus portal that
publishes it, in `apps/docusaurus`), the design, in `design/livro-caixa.pen`, and the Android app,
in `apps/mobile`: Expo SDK 58 + React Native on Firebase, with no web app —
[docs/05-arquitetura/01-plataforma-e-stack.md](docs/05-arquitetura/01-plataforma-e-stack.md). No
other stack decision is made without being written there.

- `pnpm install` at the root installs the workspace.
- `pnpm dev:docs` serves the portal at `http://localhost:4000`.
- `pnpm verify` runs the portal's tests and the build, which fails on a broken link.
- `pnpm typecheck:mobile` type-checks the app; `pnpm mobile <script>` runs any script of
  `apps/mobile`.
- `pnpm android` builds the app and opens it on the Android emulator. It needs the Android SDK,
  which only the developer's PC has: this container runs the type check, the lint and the tests,
  never the native build. `pnpm android --no-bundler` skips the Metro it would leave on 8081, which
  the journeys' stack needs.
- `pnpm firebase:emulators` starts the Firebase emulators (Auth, Firestore, Storage; their UI on
  port 4001, since the portal holds 4000), and `pnpm test:rules` tests `firebase/firestore.rules`
  against an emulator of its own. Both need Java, which the claude-box lends this container from
  the PC, so they run here too; both take port 8080, so neither runs while the journeys' stack is
  up. The app talks to the emulators when started with `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true`.
- `pnpm journeys:stack` starts the journeys' stack (the Firebase emulators and Metro with the app
  pointed at them) and `pnpm journeys:test` runs the Maestro flows, both in this container, against
  the Android 15 emulator of the PC (`Livro_Caixa_API_35`): skill `app-journeys`.
- `apps/mobile/google-services.json` comes from the Firebase console and stays out of Git: the
  native build needs it.

## Language

Code, skills, rules and every `CLAUDE.md` are written in English. In pt-BR: comments, the
documentation, the text people read, commit messages and branch names —
[.claude/rules/code-language.md](.claude/rules/code-language.md).

## Branches

`main` triggers the CI (not configured yet). Work happens on `#NN-subject` branches: a two-digit
sequential number and a kebab-case subject in pt-BR, as in projeto-a (`#01-inicio`,
`#02-banco-real-nos-endpoints`). Each one merges into `main` when it is done. After the
installation commit nothing is committed straight to `main`, and `main` is the `<base>` of the
"Revisão da branch". The first branch, `#01-brainstorm`, is where the brainstorm writes the
documentation. Commit messages follow the `commit-convention` skill.

In the shell, quote the name: a `#` at the start of a word begins a comment —
`git switch -c "#04-assunto"`.

## Documentation

The rules for writing the documentation are in [docs/CLAUDE.md](docs/CLAUDE.md). Working drafts
(plans, notes, PR descriptions) live in `docs/local/`, outside Git.

The design is made in Pencil, in `design/livro-caixa.pen`, following the `design-from-scratch`
skill. A `.pen` file can only be read and edited through the `pencil` MCP, which acts on the file
active in the editor: check it with `get_app_state` before writing.

The data model is drawn in dbdiagram.io, in
[docs/05-arquitetura/modelo-de-dados.dbml](docs/05-arquitetura/modelo-de-dados.dbml), and serves
only the documentation: no SQL or migration is generated from it. The file is the source: the model
is edited in it, pasted into dbdiagram.io to see the diagram, and what changes there comes back to
the file. Tables, columns and enums are named in English, `Note`s and `//` comments are in pt-BR.
