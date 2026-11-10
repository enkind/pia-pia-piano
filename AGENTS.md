Pia Pia Piano is a free agent plugin whose core is an MCP App: the agent calls one tool with a melody, a piano appears in the conversation, and the user plays the song one lit key at a time.

It is one of a family of plugins built on the same recipe as Napkin (`../Napkin`) and Better Response (`../better-response`): one Next.js deployment serving the website and the Streamable HTTP MCP route, a self-contained widget bundle, one installable directory under `plugins/`, and host marketplaces at the repository root. Keep the recipe's shape when changing any of those.

## Product context

`README.md` describes what the plugin is and how it is consumed; `DECISIONS.md` records the host evidence behind its architecture. Read both before product, architecture, or implementation work. When measured host behavior invalidates a recorded claim, update the relevant file in the same task. A reversed decision gets an amendment in `DECISIONS.md`, not a silent edit. `SUBMISSION.md` tracks the plugin-directory submission.

## Implementation guardrail

Keep the code minimal, direct, and straightforward. Implement only the path the current task requires; add no speculative features, abstractions, fallbacks, helpers, or dependencies.

The piano is a queue of notes, a keyboard, a lit key, red for a miss, Start over, and fullscreen. Tempo, falling notes, chords, scoring, recording, and a song library are scope changes, not polish.

`lib/song.ts` is the one definition of a playable song. The server validates against it and the widget lays out its keyboard from it; never let the two disagree.

## Agent-facing text

The tool description and server instructions in `app/mcp/route.ts`, the tool result text, and `plugins/pia-pia-piano/skills/piano/SKILL.md` are agent instruction. Describe what the piano is and how to write a melody for it; do not script the conversation. After a published release, changing tools, schemas, or instructions is a reviewed change in the plugin directory.

## Website

The site lives in `app/`. Its two design rules are stated at the top of `app/styles.css`; every addition must keep to them. The piano in the chat mock is the real widget bundle, framed from `/demo` and hosted by `app/piano-card.tsx`. If the widget starts using a new part of the host bridge, extend that host in the same change. Check pages in both color schemes.

## Versioning and releases

Versions are computed by semantic-release from Conventional Commits; never edit a version by hand. `fix:` is a patch (including any change to installed plugin files, the MCP server, or the widget), `feat:` a minor, `feat!:` a major; `docs:`, `ci:`, `chore:`, `test:`, and `refactor:` release nothing. Any change to the widget bundle also bumps `UI_VERSION` in `app/mcp/route.ts`, since hosts cache the resource by its URI. `widget/dist/` is a build artifact.

Work lands on `main`, which deploys to `https://pia-pia-piano-dev.vercel.app/mcp`. Production at `https://pia-pia-piano.vercel.app/mcp` changes only through the manual Release run (`gh workflow run ci.yml --ref main`). Never commit to `production`, never create version tags by hand, never run `vercel --prod` locally, and never release while a submission is in review if the release changes tools, schemas, instructions, or the widget.

## Verify

Run `pnpm lint`, `pnpm build`, and, against a running server, `pnpm test:client`. For widget changes, play a song through to the end on the site's mock and in Codex through `pnpm dev`, including a wrong key and Start over.

## Local Codex CLI

Use the signed CLI bundled with the app at `/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex`, as `agent-playground.json` does. Do not invoke `/usr/local/bin/codex`.

## Commit ownership

The agent owns committing completed work: run the validation, review the diff, stage only the task's files, and create a scoped Conventional Commits commit. Do not amend, rewrite, or push unless asked.
