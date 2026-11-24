// Hosts only let audio start inside a user gesture (DECISIONS 001), so the
// context is created on the first key press rather than at load.
let audio: AudioContext | undefined;

// Half a second of 8 kHz, 8-bit silence as a WAV data URI.
const SAMPLES = 4000;
const u16 = (n: number) => String.fromCharCode(n & 255, n >> 8);
const u32 = (n: number) => u16(n & 65535) + u16(n >>> 16);
const SILENCE =
  "data:audio/wav;base64," +
  btoa(
    `RIFF${u32(36 + SAMPLES)}WAVEfmt ${u32(16)}${u16(1)}${u16(1)}${u32(8000)}${u32(8000)}${u16(1)}${u16(8)}` +
      `data${u32(SAMPLES)}${"\x80".repeat(SAMPLES)}`,
  );

// While a media element plays, WebKit holds the playback audio session, which
// the silent switch does not mute. The ChatGPT iPhone app ignores
// navigator.audioSession, so a looping silent clip keeps the piano audible.
let silence: HTMLAudioElement | undefined;

/**
 * Creates and resumes the context. iOS counts a touch's pointerup, not its
 * pointerdown, as the gesture that may start audio, so keys call this on both.
 */
export function unlock() {
  if (!audio) {
    // iOS routes Web Audio through the ambient session, which the silent
    // switch mutes; a piano is the sound itself, so ask for playback.
    const session = (navigator as { audioSession?: { type: string } }).audioSession;
    if (session) session.type = "playback";
    audio = new AudioContext();
  }
  if (audio.state !== "running") void audio.resume();
  if (!silence) {
    silence = new Audio(SILENCE);
    silence.loop = true;
  }
  if (silence.paused) silence.play().catch(() => {});
  return audio;
}

/** A short piano-like tone: three partials under a struck-string envelope. */
export function play(midi: number) {
  const audio = unlock();

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
