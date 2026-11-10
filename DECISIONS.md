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

## 002 — The user is the clock: a melody of pitches, no durations

**Date:** 2026-11-10
**Status:** Accepted

### Context

A song on a keyboard can be taught three ways. Falling notes, as in rhythm
games, need tempo, durations, timing windows, and vertical room the inline
card does not have, and they punish a beginner for being slow. A play-along
that sounds the song at tempo needs durations from the agent and a transport.
A wait-for-me piano lights the next key and does nothing until it is pressed.

### Decision

Wait for the user. The tool takes `{ title, notes }`, each note a `pitch` in
scientific pitch notation with an optional `lyric` syllable. There are no
durations, rests, chords, or tempo, because none of them carries information
when the user sets the pace. A wrong key still sounds, flashes red, and leaves
the lit key where it is.

The keyboard shows the song's range widened to whole white keys and padded to
at least an octave. The server refuses a melody wider than three octaves, so
every key stays wide enough to hit in an inline card, and refuses any pitch it
cannot parse, both with a reason the agent can fix. `lib/song.ts` is the one
definition of a playable song, used by both the server and the widget.

The queue above the keyboard shows the melody's shape, not a row of labels:
each note is a dot set as high as its pitch, the sung syllable is the line you
read, and the note name is a small hint beneath it. Boxed note names read as
buttons sitting over the keys below them, and people playing along follow the
lit key and the words rather than the names.

The key after the lit one carries a faint wash of the same colour, and its dot
in the queue a faint one, so the hand can move before it has to. When the next
note repeats the lit one, the lit key shows a small dot instead.

Presses are judged inside a reducer against the state at the moment of each
press, not against the last render, so two keys pressed within one frame are
still scored in order.

### Consequences

Agents write less and get it wrong less: a melody is a list of note names.
The piano cannot teach rhythm, and a song whose identity is its rhythm will be
recognisable only to someone who already knows it.

### What would reopen this

- People asking to hear the song before playing it, which would bring back
  optional durations and a Listen button.
- Songs that need both hands, which would mean chords and a second lit colour.
