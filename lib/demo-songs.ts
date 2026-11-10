import type { Note, Song } from "./song";

/** Builds notes from space-separated pitches and, optionally, syllables. */
function melody(pitches: string, lyrics?: string): Note[] {
  const syllables = lyrics?.split(" ");
  return pitches.split(" ").map((pitch, index) =>
    syllables ? { pitch, lyric: syllables[index] } : { pitch },
  );
}

/** Public-domain melodies, written the way the skill teaches agents to. */
export const DEMO_SONGS: (Song & { id: string; ask: string })[] = [
  {
    id: "twinkle",
    ask: "How does Twinkle Twinkle Little Star go on piano?",
    title: "Twinkle Twinkle Little Star",
    notes: melody(
      "C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4 G4 G4 F4 F4 E4 E4 D4 G4 G4 F4 F4 E4 E4 D4 C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4",
      "Twin kle twin kle lit tle star how I won der what you are Up a bove the world so high Like a dia mond in the sky Twin kle twin kle lit tle star how I won der what you are",
    ),
  },
  {
    id: "ode",
    ask: "Teach me the Ode to Joy melody.",
    title: "Ode to Joy",
    notes: melody(
      "E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4 D4 D4 E4 C4 D4 E4 F4 E4 C4 D4 E4 F4 E4 D4 C4 D4 G3 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4",
    ),
  },
  {
    id: "mary",
    ask: "Can I play Mary Had a Little Lamb?",
    title: "Mary Had a Little Lamb",
    notes: melody(
      "E4 D4 C4 D4 E4 E4 E4 D4 D4 D4 E4 G4 G4 E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4",
      "Ma ry had a lit tle lamb lit tle lamb lit tle lamb Ma ry had a lit tle lamb its fleece was white as snow",
    ),
  },
];
