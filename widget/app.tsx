import { useEffect, useMemo, useReducer, useState } from "react";
import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { HIGHEST, LOWEST, isBlack, midiOf, nameOf, songProblem, type Song } from "../lib/song";
import { play } from "./sound";
import { requestDisplayMode, useMcpApp } from "./use-mcp-app";

const MIN_WHITE_KEYS = 8;
const MISS_FLASH_MS = 450;

/** The pitch as the agent spelled it, so a song written in flats reads in flats. */
const spell = (pitch: string) => pitch.trim().replace("#", "♯").replace(/b(?=\d)/, "♭");

export function Widget() {
  const { context, song } = useMcpApp();

  if (!song) {
    return (
      <main className="piano">
        <p className="notice">Getting the song ready…</p>
      </main>
    );
  }

  const problem = song.notes.length === 0 ? "This song has no notes." : songProblem(song.notes);
  if (problem) {
    return (
      <main className="piano">
        <p className="notice">The piano can’t play this song. {problem}</p>
      </main>
    );
  }

  // A new song from the same frame starts from its first note.
  return <Player key={JSON.stringify(song)} song={song} context={context} />;
}

/**
 * The keys a song needs, widened to whole white keys at both ends and padded
 * evenly around the melody to at least an octave, so a short tune still looks
 * like a piano and every key stays wide enough to hit.
 */
function keyboardRange(midis: number[]): [number, number] {
  let low = Math.min(...midis);
  let high = Math.max(...midis);
  if (isBlack(low)) low -= 1;
  if (isBlack(high)) high += 1;

  const whiteKeys = () => {
    let count = 0;
    for (let midi = low; midi <= high; midi++) if (!isBlack(midi)) count++;
    return count;
  };

  for (let below = true; whiteKeys() < MIN_WHITE_KEYS; below = !below) {
    if ((below && low > LOWEST) || high >= HIGHEST) low -= isBlack(low - 1) ? 2 : 1;
    else high += isBlack(high + 1) ? 2 : 1;
  }
  return [low, high];
}

type Progress = { position: number; missed: number | null; misses: number };
type Action = { type: "press"; midi: number } | { type: "clear"; misses: number } | { type: "restart" };

const START: Progress = { position: 0, missed: null, misses: 0 };

function Player({ song, context }: { song: Song; context?: McpUiHostContext }) {
  const midis = useMemo(() => song.notes.map((note) => midiOf(note.pitch)!), [song]);
  const [low, high] = useMemo(() => keyboardRange(midis), [midis]);
  const lowest = Math.min(...midis);
  const span = Math.max(1, Math.max(...midis) - lowest);
  const [down, setDown] = useState<ReadonlySet<number>>(new Set());

  // Judged against the state at the moment of each press, not the last render,
  // so two keys pressed within one frame are still scored in order.
  const [{ position, missed, misses }, dispatch] = useReducer(
    (state: Progress, action: Action): Progress => {
      switch (action.type) {
        case "press":
          if (state.position >= midis.length) return state;
          if (action.midi === midis[state.position]) {
            return { ...state, position: state.position + 1, missed: null };
          }
          return { ...state, missed: action.midi, misses: state.misses + 1 };
        case "clear":
          return action.misses === state.misses ? { ...state, missed: null } : state;
        case "restart":
          return { ...START, misses: state.misses };
      }
    },
    START,
  );

  useEffect(() => {
    if (missed === null) return;
    const timer = window.setTimeout(() => dispatch({ type: "clear", misses }), MISS_FLASH_MS);
    return () => window.clearTimeout(timer);
  }, [missed, misses]);

  const total = midis.length;
  const done = position >= total;
  const target = done ? null : midis[position];
  const fullscreen = context?.displayMode === "fullscreen";
  const canFullscreen = context?.availableDisplayModes?.includes("fullscreen") ?? false;

  function press(midi: number) {
    play(midi);
    dispatch({ type: "press", midi });
  }

  const startOver = () => dispatch({ type: "restart" });

  const release = (midi: number) =>
    setDown((current) => {
      if (!current.has(midi)) return current;
      const next = new Set(current);
      next.delete(midi);
      return next;
    });

  const whites: number[] = [];
  const blacks: { midi: number; after: number }[] = [];
  for (let midi = low; midi <= high; midi++) {
    if (isBlack(midi)) blacks.push({ midi, after: whites.length - 1 });
    else whites.push(midi);
  }

  const keyProps = (midi: number) => ({
    type: "button" as const,
    "aria-label": nameOf(midi),
    "data-target": midi === target || undefined,
    "data-missed": midi === missed || undefined,
    "data-down": down.has(midi) || undefined,
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      // Touch captures the pointer to the key it started on; releasing it lets
      // a lifted finger end the press wherever it is.
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setDown((current) => new Set(current).add(midi));
      press(midi);
    },
    onPointerUp: () => release(midi),
    onPointerCancel: () => release(midi),
    onPointerLeave: () => release(midi),
    onKeyDown: (event: React.KeyboardEvent) => {
      if ((event.key === " " || event.key === "Enter") && !event.repeat) {
        event.preventDefault();
        press(midi);
      }
    },
  });

  const upcoming = done
    ? "Finished."
    : `Next: ${spell(song.notes[position].pitch)}${song.notes[position].lyric ? `, “${song.notes[position].lyric}”` : ""}.`;

  return (
    <main className="piano" data-fullscreen={fullscreen || undefined}>
      <header>
        <h1>{song.title}</h1>
        <span className="progress">
          {position} / {total}
        </span>
        <button type="button" className="control" onClick={startOver} disabled={position === 0}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4.5 10a5.5 5.5 0 1 0 1.6-3.9" />
            <path d="M4.5 3.5v3h3" />
          </svg>
          Start over
        </button>
        {canFullscreen && (
          <button
            type="button"
            className="control icon"
            onClick={() => requestDisplayMode(fullscreen ? "inline" : "fullscreen")}
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              {fullscreen ? (
                <path d="M8 3.5V8H3.5M12 3.5V8h4.5M8 16.5V12H3.5M12 16.5V12h4.5" />
              ) : (
                <path d="M3.5 8V3.5H8M16.5 8V3.5H12M3.5 12v4.5H8M16.5 12v4.5H12" />
              )}
            </svg>
          </button>
        )}
      </header>

      {done ? (
        <div className="finished">
          <p>You played all {total} notes.</p>
          <button type="button" className="control" onClick={startOver}>
            Play again
          </button>
        </div>
      ) : (
        // The melody's shape rather than a row of labels: each note is a dot set
        // as high as its pitch, with the sung syllable as the reading line and
        // the note name only as a quiet hint, so nothing here looks pressable.
        <div className="queue" aria-hidden="true">
          <ol
            data-lyrics={song.notes.some((note) => note.lyric) || undefined}
            style={{ "--at": Math.max(0, position - 1) } as React.CSSProperties}
          >
            {song.notes.map((note, index) => (
              <li
                key={index}
                data-state={index < position ? "played" : index === position ? "next" : undefined}
              >
                <span
                  className="contour"
                  style={{ "--rise": (midis[index] - lowest) / span } as React.CSSProperties}
                >
                  <span className="dot" />
                </span>
                <span className="lyric">{note.lyric}</span>
                <span className="pitch">{spell(note.pitch)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {upcoming}
      </p>

      <div className="keys" style={{ "--whites": whites.length } as React.CSSProperties}>
        {whites.map((midi) => (
          <button key={midi} className="white" {...keyProps(midi)}>
            <span>{midi % 12 === 0 ? nameOf(midi) : nameOf(midi).slice(0, 1)}</span>
          </button>
        ))}
        {blacks.map(({ midi, after }) => (
          <button
            key={midi}
            className="black"
            style={{ "--after": after } as React.CSSProperties}
            {...keyProps(midi)}
          />
        ))}
      </div>
    </main>
  );
}
