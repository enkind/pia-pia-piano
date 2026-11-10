import { useEffect, useState } from "react";
import { requestDisplayMode, useHostContext } from "./use-mcp-app";

const WHITE_KEYS = [
  { midi: 60, name: "C4" },
  { midi: 62, name: "D4" },
  { midi: 64, name: "E4" },
  { midi: 65, name: "F4" },
  { midi: 67, name: "G4" },
  { midi: 69, name: "A4" },
  { midi: 71, name: "B4" },
  { midi: 72, name: "C5" },
];
// Each black key sits on the boundary after the white key at `after`.
const BLACK_KEYS = [
  { midi: 61, name: "C#4", after: 0 },
  { midi: 63, name: "D#4", after: 1 },
  { midi: 66, name: "F#4", after: 3 },
  { midi: 68, name: "G#4", after: 4 },
  { midi: 70, name: "A#4", after: 5 },
];

// Created at load, before any gesture, so its first state tells us whether the
// host's autoplay policy lets audio start unprompted.
const audio = new AudioContext();
const audioStateAtLoad = audio.state;

function play(midi: number) {
  const frequency = 440 * 2 ** ((midi - 69) / 12);
  const start = audio.currentTime;
  const end = start + 1.8;
  const envelope = audio.createGain();
  envelope.connect(audio.destination);
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(0.35, start + 0.005);
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

export function Widget() {
  const context = useHostContext();
  const [audioState, setAudioState] = useState(audio.state);
  const [pressed, setPressed] = useState<number | null>(null);
  const [notesPlayed, setNotesPlayed] = useState(0);
  const [displayResult, setDisplayResult] = useState<string | null>(null);

  useEffect(() => {
    const onChange = () => setAudioState(audio.state);
    audio.addEventListener("statechange", onChange);
    return () => audio.removeEventListener("statechange", onChange);
  }, []);

  async function press(midi: number) {
    setPressed(midi);
    if (audio.state !== "running") await audio.resume();
    play(midi);
    setNotesPlayed((count) => count + 1);
  }

  async function toggleFullscreen() {
    const mode = context?.displayMode === "fullscreen" ? "inline" : "fullscreen";
    try {
      const result = await requestDisplayMode(mode);
      setDisplayResult(`asked ${mode}, got ${result.mode}`);
    } catch (error) {
      setDisplayResult(`asked ${mode}, failed: ${String(error)}`);
    }
  }

  const keyProps = (midi: number) => ({
    onPointerDown: (event: React.PointerEvent) => {
      event.preventDefault();
      void press(midi);
    },
    onPointerUp: () => setPressed(null),
    onPointerLeave: () => setPressed(null),
    "data-pressed": pressed === midi ? "" : undefined,
  });

  const diagnostics: [string, unknown][] = [
    ["audio at load", audioStateAtLoad],
    ["audio now", audioState],
    ["notes played", notesPlayed],
    ["display mode", context?.displayMode],
    ["available modes", context?.availableDisplayModes],
    ["platform", context?.platform],
    ["device", context?.deviceCapabilities],
    ["container", context?.containerDimensions],
    ["user agent", context?.userAgent],
    ["display request", displayResult],
  ];

  return (
    <main className="piano">
      <header>
        <span>Sound check: tap any key</span>
        {context?.availableDisplayModes?.includes("fullscreen") && (
          <button type="button" onClick={toggleFullscreen}>
            {context.displayMode === "fullscreen" ? "Exit fullscreen" : "Fullscreen"}
          </button>
        )}
      </header>
      <div className="keys" style={{ "--white-count": WHITE_KEYS.length } as React.CSSProperties}>
        {WHITE_KEYS.map((key) => (
          <button key={key.midi} type="button" className="white" aria-label={key.name} {...keyProps(key.midi)}>
            <span>{key.name}</span>
          </button>
        ))}
        {BLACK_KEYS.map((key) => (
          <button
            key={key.midi}
            type="button"
            className="black"
            aria-label={key.name}
            style={{ "--after": key.after } as React.CSSProperties}
            {...keyProps(key.midi)}
          />
        ))}
      </div>
      <dl>
        {diagnostics.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value === undefined || value === null ? "—" : typeof value === "string" || typeof value === "number" ? value : JSON.stringify(value)}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
