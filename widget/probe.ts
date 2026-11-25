// TEMPORARY: measures why the silent switch mutes the piano in the ChatGPT
// iPhone app (DECISIONS 001). Remove once read.

const SAMPLES = 4000;
const u16 = (n: number) => String.fromCharCode(n & 255, n >> 8);
const u32 = (n: number) => u16(n & 65535) + u16(n >>> 16);
const WAV =
  `RIFF${u32(36 + SAMPLES)}WAVEfmt ${u32(16)}${u16(1)}${u16(1)}${u32(8000)}${u32(8000)}${u16(1)}${u16(8)}` +
  `data${u32(SAMPLES)}${"\x80".repeat(SAMPLES)}`;

const violations = new Set<string>();
document.addEventListener("securitypolicyviolation", (event) => violations.add(event.violatedDirective));

function frame() {
  if (window.top === window) return "top";
  try {
    return window.top?.location.href ? "same" : "cross";
  } catch {
    return "cross";
  }
}

// Called synchronously inside the gesture, so play() gets the activation.
function clip(src: string) {
  const element = new Audio(src);
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

export async function probe(audio: AudioContext) {
  const session = (navigator as { audioSession?: { type: string } }).audioSession;
  const data = clip(`data:audio/wav;base64,${btoa(WAV)}`);
  const bytes = Uint8Array.from(WAV, (c) => c.charCodeAt(0));
  const blob = clip(URL.createObjectURL(new Blob([bytes], { type: "audio/wav" })));
  const [dataResult, blobResult] = await Promise.all([data, blob]);
  return [
    `frame=${frame()}`,
    `ua=${/Safari\//.test(navigator.userAgent) ? "safari" : "webview"}`,
    `session=${session ? session.type : "none"}`,
    `ctx=${audio.state}`,
    `data=${dataResult}`,
    `blob=${blobResult}`,
    `csp=${[...violations].join(",") || "none"}`,
  ].join(" ");
}
