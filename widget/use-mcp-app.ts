import { useSyncExternalStore } from "react";
import { App, type McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { version } from "../package.json";

// The host establishes one bridge per iframe, so the `App` lives at module
// scope rather than per component.
const app = new App(
  { name: "pia-pia-piano-widget", version },
  { availableDisplayModes: ["inline", "fullscreen"] },
  { autoResize: true },
);

let hostContext: McpUiHostContext | undefined;
const listeners = new Set<() => void>();

function update() {
  hostContext = app.getHostContext();
  for (const listener of listeners) listener();
}

app.onhostcontextchanged = update;
app.onerror = (error) => console.error("[mcp-app] error:", error);

if (window.self !== window.top) {
  app.connect().then(update, (error) =>
    console.warn("[mcp-app] connect failed (not running in an MCP host?):", error),
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useHostContext() {
  return useSyncExternalStore(subscribe, () => hostContext);
}

export function requestDisplayMode(mode: "inline" | "fullscreen") {
  return app.requestDisplayMode({ mode });
}
