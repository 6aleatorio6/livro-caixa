---
paths:
  - "apps/back/src/**"
  - "apps/web/src/**"
---

# Code explains itself through structure and names; comments keep the why

Before commenting or extracting a function, find out **why** the passage is hard to read.
Extracting only hides the passage behind a name: if the confusion comes from the code's shape, it is
still in there. From the most frequent cause to the rarest (the examples come from projeto-a, where the
rule was born):

- **The same rule in more than one place → one place**, called by all. E.g. "an active
  Administrator always remains", checked on role change, deactivation and user deletion.
- **The decision in the middle of reading and writing → the decision as a pure function**; the
  orchestrator reads, calls and writes. E.g. `codeConflicts`, which the use case calls between the
  read and the writes.
- **A guarantee that only exists in a comment → a type that carries it**: a value object, a
  discriminated union, a narrower signature. E.g. `byEmail(email: Email)`, which replaced
  `byEmail(email: string)` and the comment "o e-mail já chega normalizado".
- **A value translated into another by `if`, `switch` or ternary → a lookup table.** E.g. the users
  filter status (`'active'`, `'inactive'`) becoming `isActive`.
- **A stored value that can be computed → the value derived on the spot**, and state that admits
  an invalid combination → a discriminated union.
- **Deep nesting → early return**; in the UI, one component per screen state, each in its own file
  ([one-export-per-file.md](one-export-per-file.md)).
- **Repeated search in a list → the right data structure**: a `Map` by id, a `Set`. E.g.
  `usersById`.
- **A vague or misleading name → rename it**, per [Naming](#naming).
- **Several steps that take effort to read, with the structure already right → extract**, named
  after what the passage does; a single expression becomes a named variable. E.g. an `execute` that
  reads as the list of rules it checks. In the UI, the extracted passage becomes a component in its
  own file.

**The extraction test:** the caller understands the extracted function by its name, without opening
the body. If the body must be read to understand the caller, the two are entangled, and the passage
goes back where it was. A single-expression function called from one place goes back too: the jump
hides nothing. E.g. `exception instanceof DomainError` inline in the error filter. A pure domain
rule stays, even with one caller: it is the unit the domain test covers.

## Naming

- **Booleans start with `is`, `has`, `can`, `should` or `was`**, in every app: variable,
  parameter, component prop (`isOpen`, `isPending`) and API contract field (`isFromDirectory`).
  Only a prop the *wrapper* passes straight to HTML or to the library keeps the library's name:
  `required`, `disabled`, `autoFocus`, `multiline`, `replace`. A field the back-end translates for
  a library follows the rule (`shouldTrustServerCertificate` becomes the driver's
  `trustServerCertificate`).
- **State and intent get different names.** `option.isActive` is what the option is, and
  `shouldBeActive`, what it should become.
- **Conditions in the affirmative.** `isInternalPath`, instead of four negated clauses.
- **A list in the plural of what it holds** (`deletedIds`), and **a map as `<values>By<key>`**
  (`usersById`).
- **The name says what the value is**, not where it came from or when: `resetCode` instead of
  `saved`, `currentCredential` instead of `existing`. `data`, `result` and `next` give way to the
  name of what the value holds.
- **A number carries its unit in the name**: `validityMinutes`, `delayMs`.
- **One value, one name.** The same value has the same name along the whole chain: in the caller
  and in the rule, in the domain and in the contract.
- **An action function takes a verb** (`saveChanges`), **a pure calculation takes a noun**
  (`codeConflicts`), and **a check that throws starts with `ensure`**. A lookup that throws when
  nothing is found starts with `get`; one that returns `null` starts with `find`.

## Comments

- **The comment that says why stays**: the business rule, the constraint the database doesn't
  guarantee, the order that must not change, the ADR behind the decision. The docblock of an
  exported declaration follows the same line. Comments are written in pt-BR
  ([code-language.md](code-language.md)).
- **A comment narrating what or how is a missing name.** A section label inside a function
  (`// monta o payload`), one that repeats the line below and a docblock that restates the name in
  other words become a variable, function or type name, per the list at the top.

**Why:** in projeto-a, finished use cases were rewritten just to get the names they lacked; writing this
way the first time saves the refactor. Research on code reading points the same way: descriptive
names speed up understanding, misleading names cancel the gain, and extracting a simple passage
makes reading slower. There the decision is ADR-0054.

**How to apply:**

- No lint checks the boolean prefix yet. In projeto-a it is `@typescript-eslint/naming-convention`, in
  each app's ESLint, with the exception list of props that pass HTML or library attributes through;
  it can come along when the apps are created. The rest of this rule (structure, misleading names,
  comments) no lint sees: it is on whoever writes and whoever reviews.
- Fix what you are already touching; don't sweep the repository for names or comments.
- Before deleting a comment, check that its fact moved into a name: losing a real constraint is
  worse than keeping the comment.
- Renaming an API contract field changes the contract: whatever is generated from it changes in the
  same commit (skill `commit-convention`).
