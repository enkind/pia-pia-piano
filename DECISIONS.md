# Decisions

## 001 — Synthesize sound in the widget, started by the user's first tap

**Date:** 2026-11-10
**Status:** Accepted
**Measured against:** Codex desktop (`/Applications/ChatGPT.app`) through
`@enkind/agent-playground` 0.1.1, `@modelcontextprotocol/ext-apps` 2.x; Cursor
read from its shipped bundle only

### Context

A piano that cannot make a sound is a picture of a piano, so whether an MCP App
may play audio at all decided whether this project exists. The MCP Apps spec
says nothing about audio: its resource `permissions` cover camera, microphone,
geolocation, and clipboard writes, and nothing else.

### What we measured

Neither host's sandbox stands in the way. Codex frames apps with
`sandbox="allow-scripts allow-same-origin"`, Cursor with `allow-scripts`, and
Web Audio needs neither more flags nor a permission.

Both gate audio behind a user gesture. Cursor's Electron runs with
`autoplayPolicy: "user-gesture-required"`. In Codex, an `AudioContext` created
when the widget loads reports `suspended`; after the first tap on a key,
`resume()` moves it to `running` and the note is heard. Two taps, two notes.

Fullscreen differs by host. Codex offers it when the app declares it: with
`availableDisplayModes: ["inline", "fullscreen"]` in the `App` capabilities,
the host reported both modes, showed its own "Open app in tab" control, and
answered `requestDisplayMode({ mode: "fullscreen" })` with `fullscreen`,
moving the widget into a tab beside the thread (`maxHeight: 772, maxWidth: 615`
there, against `maxWidth: 736` inline). Cursor reports only `inline` and
answers every display-mode request with `inline`.

### Decision

Play notes with a small Web Audio synthesizer in the widget: three sine
partials under a fast-attack, exponential-decay envelope. The bundle stays
self-contained, with no samples to inline or fetch. Never sound before the
user has tapped; the first tap resumes the context.

Declare fullscreen in the app's capabilities, and show a fullscreen control
only when the host lists it in `availableDisplayModes`. There is no rotation
to landscape: locking orientation needs the document's own fullscreen, which
a sandboxed frame does not get, so the keyboard fits the frame instead by
showing only the range a song uses.

### Consequences

The tone is recognisably a keyboard but not a piano. A song cannot start
playing by itself when the widget opens, which suits a wait-for-me piano where
the user plays every note.

### What would reopen this

- The synthesized tone proving too thin for people to enjoy, which would mean
  weighing a few compressed samples against bundle size.
- A host that blocks Web Audio even after a gesture.
- Cursor or a mobile host offering fullscreen, or a mobile host where the
  keyboard cannot fit in portrait.
