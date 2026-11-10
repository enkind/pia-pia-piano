# Pia Pia Piano

<p align="center">
  <img src="./plugins/pia-pia-piano/pia-pia-piano.svg" alt="Pia Pia Piano logo" width="120">
</p>

A playable piano for your agent. It knows the song; you play it.

[Website](https://pia-pia-piano.vercel.app) · [Privacy](https://pia-pia-piano.vercel.app/privacy) · [Terms](https://pia-pia-piano.vercel.app/terms) · [Issues](https://github.com/enkind/pia-pia-piano/issues)

Pia Pia Piano is a small, free agent plugin whose core is an **MCP App**: a
remote MCP server that ships an interactive widget the host renders in the
conversation. Ask how a song goes, and the agent calls one tool with the
melody written out note by note. A piano appears with only the keys the song
needs. The next key lights up and waits until you press it; a wrong key
flashes red and the song waits. There is no tempo to keep up with.

It exists because the alternatives are worse. A list of note names still needs
you to know where C4 is, a separate piano app means switching between windows,
and an agent-drawn one-off UI is supported by almost no host.

Questions and bug reports go to the issue tracker; support is best-effort on a
noncommercial project. MIT licensed.

## Install

Paste this into Codex, Cursor, or Claude Code, then start a new chat:

```text
Install the Pia Pia Piano plugin from the production branch of https://github.com/enkind/pia-pia-piano
```

Or do what the agent would do. The repository is a marketplace containing one
plugin, `plugins/pia-pia-piano`, for each host:

```sh
# Codex
codex plugin marketplace add enkind/pia-pia-piano
codex plugin add pia-pia-piano@pia-pia-piano

# Claude Code
claude plugin marketplace add enkind/pia-pia-piano
claude plugin install pia-pia-piano@pia-pia-piano
```

There is no account and no key. Every host connects to the same Streamable HTTP
endpoint, `https://pia-pia-piano.vercel.app/mcp`. Install from the `production`
branch for the released plugin; `main` carries **Pia Pia Piano (Dev)**, which
connects to `https://pia-pia-piano-dev.vercel.app/mcp`.

## What v1 is

A queue of notes, a keyboard, a lit key, red for a miss, Start over, and
fullscreen where the host offers it. Melody only: no chords, no tempo, no
scoring, no recording. See [DECISIONS.md](./DECISIONS.md) for why.

## The tool

`open_piano({ title, notes })`, where each note is `{ pitch, lyric? }` in
scientific pitch notation (`C4` is middle C). The server checks every pitch
and refuses a melody wider than three octaves with a reason the agent can act
on. Nothing is stored and nothing comes back when the user finishes.
`plugins/pia-pia-piano/skills/piano/SKILL.md` teaches agents how to write a
melody for it; users can ask for it directly with `/piano`.

## Layout

```text
app/                 Website, /demo, and the Streamable HTTP MCP route at /mcp
  mcp/route.ts         MCP server: open_piano and the ui:// resource
  piano-card.tsx       the page acting as the widget's MCP Apps host
  demo/route.ts        the widget bundle, served as a page for the site's mock
  .well-known/openai-apps-challenge/route.ts   plugin-directory domain check
lib/song.ts          the note contract shared by the server and the widget
widget/              the piano: a Vite app built into one self-contained HTML file
plugins/pia-pia-piano/   everything a host installs: skill, manifests, logo, MCP URL
scripts/test-client.mjs  protocol smoke test against a running server
scripts/set-endpoint.mjs writes a deployment URL into the plugin
assets/submission/   directory and composer icons for the plugin submission
```

The root `.agents/`, `.cursor-plugin/`, and `.claude-plugin/` folders are one
marketplace catalog per host, each listing `plugins/pia-pia-piano`.

## Develop

```sh
pnpm install
pnpm dev          # agent-playground: watched server + an isolated Codex with this plugin
pnpm dev:server   # just the server and the site, at http://localhost:3200
pnpm test:client  # protocol smoke test against http://localhost:3200
pnpm lint && pnpm build
```

`pnpm dev` runs [agent-playground](https://github.com/enkind/agent-playground)
from `agent-playground.json`: it builds the widget, starts the watched server,
and launches a disposable Codex instance whose plugin points at
`http://127.0.0.1:3200/mcp`. Widget edits need only a new chat, not a restart.
The site's home page hosts the real widget, so `pnpm dev:server` and a browser
are the fastest loop for widget work.

## Deploy and release

| Environment | Git | MCP URL |
| --- | --- | --- |
| Development | every push to `main`, published as a `vX.Y.Z-dev.N` prerelease | `https://pia-pia-piano-dev.vercel.app/mcp` |
| Production | the manual Release run, published as `vX.Y.Z` | `https://pia-pia-piano.vercel.app/mcp` |

`.github/workflows/ci.yml` calls the shared Enkind plugin pipeline in
[`enkind/.github`](https://github.com/enkind/.github), and `plugin-release.json`
describes this repository to it. Commit subjects follow Conventional Commits,
and semantic-release computes every version. To release, run
`gh workflow run ci.yml --ref main`. Every release attaches
`pia-pia-piano-<version>.zip`, the archive to upload to the plugin directory.
`SUBMISSION.md` tracks the directory submission.

## Stack

- `mcp-handler` 2, `@modelcontextprotocol/server` 2, and `@modelcontextprotocol/ext-apps` 2
- Vite 8 with `vite-plugin-singlefile` for the widget, Web Audio for the sound
- Next.js 16 on Vercel for the website and the MCP server
