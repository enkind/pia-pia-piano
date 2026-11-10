---
name: piano
description: Opens a playable piano set up to teach one melody, so the user can play a song instead of reading its notes. Always use when the user selects this skill or invokes /piano. Also use when the user asks how a song goes on piano or keyboard, wants to learn, practise, or play a melody, or asks for the notes of a tune.
license: MIT
---

# Pia Pia Piano

`open_piano` puts a piano in the conversation with a song's melody lined up. The
keyboard shows only the keys the song needs, the next key lights up, and it
waits until the user presses it. A wrong key flashes red and the song waits.
There is no tempo: the user sets the pace, so it suits someone who cannot read
music.

## The one tool

`open_piano({ title, notes })`, where each note is `{ pitch, lyric? }`.

- `pitch` is scientific pitch notation: a letter, an optional `#` or `b`, and an
  octave. Middle C is `C4`; the A above it is `A4`.
- `lyric` is the syllable sung on that note, when the song has words. Split
  words the way they are sung: "Twin", "kle", "twin", "kle".

## Writing the melody

1. **Melody only.** One entry per key press, in order. No chords, no
   accompaniment, no left hand. A repeated note is written twice.
2. **No rests or durations.** The piano waits for the user, so timing carries
   no information. Leave pauses out.
3. **Keep it playable.** Three octaves at most, and around C4 to C6 suits most
   songs. Transpose rather than spanning a wide range. Simple keys with few
   sharps or flats, such as C major, are easier for a beginner.
4. **Be accurate.** Write the melody you know. If you are not sure how it goes,
   look it up rather than inventing notes, and say so if you could not confirm
   it. A shorter, recognisable section, like the chorus, is better than a
   doubtful whole song.

If a note is invalid or the range is too wide, the tool returns an error that
says which note. Fix it and call again.

## After calling it

Say something short, like that the piano is ready and the lit key is the one
to press. Do not repeat the notes as text; they are already on the keys.
Nothing comes back when the user finishes, so do not wait for a result.

When the user invokes `/piano` without naming a song, ask which song they
want, or offer a simple one such as "Twinkle Twinkle Little Star".

## When the host has no UI

The piano needs a host that renders MCP Apps. Where it does not appear, give
the notes as text instead, grouped by phrase.
