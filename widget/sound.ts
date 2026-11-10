// Hosts only let audio start inside a user gesture (DECISIONS 001), so the
// context is created on the first key press rather than at load.
let audio: AudioContext | undefined;

/** A short piano-like tone: three partials under a struck-string envelope. */
export function play(midi: number) {
  audio ??= new AudioContext();
  if (audio.state !== "running") void audio.resume();

  const frequency = 440 * 2 ** ((midi - 69) / 12);
  const start = audio.currentTime;
  const end = start + 1.8;
  const envelope = audio.createGain();
  envelope.connect(audio.destination);
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(0.3, start + 0.005);
  envelope.gain.exponentialRampToValueAtTime(0.001, end);

  for (const [ratio, level] of [[1, 1], [2, 0.4], [3, 0.15]]) {
    const partial = audio.createGain();
    partial.gain.value = level;
    partial.connect(envelope);
    const oscillator = audio.createOscillator();
    oscillator.frequency.value = frequency * ratio;
    oscillator.connect(partial);
    oscillator.start(start);
    oscillator.stop(end);
  }
}
