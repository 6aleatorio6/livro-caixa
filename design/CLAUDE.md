# design — rules for the app's design

The design is made in Pencil, in `livro-caixa.pen`, following the `design-from-scratch` skill; the
`design` skill reads it, edits it and checks a built screen against it.

## The `.pen` only through the `pencil` MCP

A `.pen` file is encrypted: it can only be read and edited through the `pencil` MCP, which acts on
the file active in the editor. Check it with `get_app_state` before writing. An edit stays in the
editor until the person saves in Pencil: ask for the save before a commit.

## Every file the `.pen` uses lives in this folder

An image fill points to a file in `design/`, by a path relative to the `.pen` (`vision-board/…`,
`icon/…`, `illustrations/…`). Where each image came from and its license go in a `sources.md` next
to it, as in `vision-board/`.

**Why:** the vision board used to point to `docs/local/vision-board/`, outside Git, and every image
broke when that folder went to the trash (2026-10-28). Leonardo asked for the files Pencil uses to
stay in its folder.

## Screens: 412 × 915

Every screen is a top-level frame of 412 × 915, the Pixel 7 the app is checked on
(`Livro_Caixa_API_35`), named "Tela · …" or "Estado · …" for a state over a screen, and listed in
the `09 Telas` index. What passes 915 is cut as on the phone, with the navigation bar pinned at the
bottom, and the rest gets a frame of its own, scrolled: "Tela · Início, fim da lista" is an instance
of the Início with its content aligned to the end.

**Why:** decided by Leonardo on 2026-10-29, when the screens had heights from 122 to 1274.

## Exporting

Pencil runs on the PC, not in this container: `Export` writes to the PC's disk, and a path in the
container's `/tmp` or scratchpad reports success and leaves nothing here. Export into the
repository, under `journeys/.local/design/`, which Git ignores and the visual conference keeps.

## Proceed and choose

In design work, Leonardo prefers reacting to a finished result in the `.pen` over answering
questions step by step: he skipped the briefing questions ("vai fazendo que vou olhando e dando
feedback") and, after choosing the direction and the palette, said "vai fazendo e escolhendo por
conta" (2026-10-24). Generate the variations, pick one with a reason tied to `00 Briefing`, record it
in the frame's Decisão block as the AI's choice at his request, remove the discarded variations, and
move on. Still stop for what is outside the design file (product rules, docs that change behavior,
stack decisions): those go to the docs, and he decides.
