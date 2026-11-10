/**
 * The song contract shared by the MCP server, which validates what the agent
 * sends, and the widget, which lays out a keyboard for it.
 */

export type Note = { pitch: string; lyric?: string };
export type Song = { title: string; notes: Note[] };

/** Scientific pitch notation: a letter, an optional sharp or flat, an octave. */
export const PITCH = /^([A-G])([#♯b♭]?)([0-8])$/;

/** A0 to C8, the 88 keys of a full-size piano. */
export const LOWEST = 21;
export const HIGHEST = 108;

/** Three octaves, so every key stays wide enough to hit in an inline card. */
export const MAX_SPAN = 36;

export const MAX_NOTES = 500;

const STEPS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const ALTER: Record<string, number> = { "": 0, "#": 1, "♯": 1, b: -1, "♭": -1 };

/** MIDI number of a pitch such as `C4` (60), or null if it is not one. */
export function midiOf(pitch: string): number | null {
  const match = PITCH.exec(pitch.trim());
  if (!match) return null;
  return 12 * (Number(match[3]) + 1) + STEPS[match[1]] + ALTER[match[2]];
}

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function nameOf(midi: number): string {
  return `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

export function isBlack(midi: number): boolean {
  return NAMES[midi % 12].length > 1;
}

/** Why the piano cannot play this song, or null when it can. */
export function songProblem(notes: Note[]): string | null {
  const midis: number[] = [];
  for (const [index, note] of notes.entries()) {
    const midi = midiOf(note.pitch);
    if (midi === null) {
      return `Note ${index + 1} is "${note.pitch}", which is not a pitch like C4, F#3, or Bb4.`;
    }
    if (midi < LOWEST || midi > HIGHEST) {
      return `Note ${index + 1} (${note.pitch}) is outside the piano's range of A0 to C8.`;
    }
    midis.push(midi);
  }
  const span = Math.max(...midis) - Math.min(...midis);
  if (span > MAX_SPAN) {
    return (
      `The melody spans ${span} semitones, from ${nameOf(Math.min(...midis))} to ` +
      `${nameOf(Math.max(...midis))}. Keep it within three octaves (${MAX_SPAN} semitones).`
    );
  }
  return null;
}
