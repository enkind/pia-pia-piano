// TEMPORARY: measures why the silent switch mutes the piano in the ChatGPT
// iPhone app (DECISIONS 001). Remove once read.

const u16 = (n: number) => String.fromCharCode(n & 255, (n >> 8) & 255);
const u32 = (n: number) => u16(n & 65535) + u16(n >>> 16);

/** Half a second of silence as a PCM WAV. */
function wav(rate: number, bits: 8 | 16) {
  const bytes = (rate / 2) * (bits / 8);
  const zero = bits === 8 ? "\x80" : "\x00";
  return btoa(
    `RIFF${u32(36 + bytes)}WAVEfmt ${u32(16)}${u16(1)}${u16(1)}${u32(rate)}${u32((rate * bits) / 8)}` +
      `${u16(bits / 8)}${u16(bits)}data${u32(bytes)}${zero.repeat(bytes)}`,
  );
}

const violations = new Set<string>();
document.addEventListener("securitypolicyviolation", (event) => violations.add(event.violatedDirective));

function settle(element: HTMLAudioElement) {
  element.loop = true;
  const played = element.play().then(
    () => "played",
    (error: Error) => error.name,
  );
  const timeout = new Promise<string>((resolve) => setTimeout(() => resolve("pending"), 2000));
  return Promise.race([played, timeout]).then((result) =>
    element.error ? `${result}/err${element.error.code}` : result,
  );
}

// Called synchronously inside the gesture, so play() gets the activation.
export async function probe(audio: AudioContext) {
  const session = (navigator as { audioSession?: { type: string } }).audioSession;
  const wav8 = settle(new Audio(`data:audio/wav;base64,${wav(8000, 8)}`));
  const wav16 = settle(new Audio(`data:audio/wav;base64,${wav(44100, 16)}`));
  // A playing media element holds WebKit's playback session; a live stream
  // from the context needs no source to load.
  const element = new Audio();
  element.srcObject = audio.createMediaStreamDestination().stream;
  const stream = settle(element);
  const results = await Promise.all([wav8, wav16, stream]);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    `session=${session ? session.type : "none"}`,
    `ctx=${audio.state}`,
    `wav8=${results[0]}`,
    `wav16=${results[1]}`,
    `stream=${results[2]}`,
    `csp=${[...violations].join(",") || "none"}`,
  ].join(" ");
}
