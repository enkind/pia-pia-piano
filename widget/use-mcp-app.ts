import { useSyncExternalStore } from "react";
import {
  App,
  applyDocumentTheme,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";
import type { Song } from "../lib/song";
import { version } from "../package.json";

// The host establishes one bridge per iframe, so the `App` lives at module
// scope rather than per component.
const app = new App(
  { name: "pia-pia-piano-widget", version },
  { availableDisplayModes: ["inline", "fullscreen"] },
  { autoResize: true },
);

type State = { context?: McpUiHostContext; song?: Song };

let state: State = {};
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

function adoptContext() {
  const context = app.getHostContext();
  if (context?.theme) applyDocumentTheme(context.theme);
  set({ context });
}

/** The song arrives as the tool's arguments, and again echoed in its result. */
function adoptSong(value: unknown) {
  const song = value as Partial<Song> | undefined;
  if (typeof song?.title === "string" && Array.isArray(song.notes)) {
    set({ song: { title: song.title, notes: song.notes } });
  }
}

app.ontoolinput = (params) => adoptSong(params.arguments);
app.ontoolresult = (result) => adoptSong(result.structuredContent);
app.onhostcontextchanged = adoptContext;
app.onerror = (error) => console.error("[mcp-app] error:", error);

if (window.self !== window.top) {
  app.connect().then(adoptContext, (error) =>
    console.warn("[mcp-app] connect failed (not running in an MCP host?):", error),
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMcpApp() {
  return useSyncExternalStore(subscribe, () => state);
}

export async function requestDisplayMode(mode: "inline" | "fullscreen") {
  try {
    await app.requestDisplayMode({ mode });
  } catch (error) {
    console.warn("[mcp-app] display mode request failed:", error);
  }
}
