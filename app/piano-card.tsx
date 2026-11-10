"use client";

import { useEffect, useRef, useState } from "react";
import type { Song } from "../lib/song";
import { version } from "../package.json";

// Codex's measured inline ceiling, so the piano here meets the same frame it
// meets in a real host.
const CEILING = 620;

const theme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

/**
 * The page is the piano's host. It speaks the part of the MCP Apps bridge the
 * widget uses — initialize, the tool input carrying the song, size requests,
 * and theme changes — so the frame holds the unmodified widget rather than a
 * picture of it.
 */
export function PianoCard({ song, inactive }: { song: Song; inactive?: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    function post(message: unknown) {
      frame.current?.contentWindow?.postMessage(message, window.location.origin);
    }

    function onMessage(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow) return;
      const message = event.data;
      if (message?.jsonrpc !== "2.0") return;

      switch (message.method) {
        case "ui/initialize":
          post({
            jsonrpc: "2.0",
            id: message.id,
            result: {
              protocolVersion: "2026-01-26",
              hostInfo: { name: "pia-pia-piano-site", version },
              hostCapabilities: {},
              hostContext: {
                displayMode: "inline",
                availableDisplayModes: ["inline"],
                containerDimensions: { maxHeight: CEILING },
                platform: "desktop",
                theme: theme(),
              },
            },
          });
          break;

        case "ui/notifications/initialized":
          post({
            jsonrpc: "2.0",
            method: "ui/notifications/tool-input",
            params: { arguments: { title: song.title, notes: song.notes } },
          });
          break;

        case "ui/notifications/size-changed":
          setHeight(Math.min(message.params?.height ?? CEILING, CEILING));
          break;

        default:
          if (message.id !== undefined) post({ jsonrpc: "2.0", id: message.id, result: {} });
      }
    }

    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () =>
      post({
        jsonrpc: "2.0",
        method: "ui/notifications/host-context-changed",
        params: { theme: theme() },
      });

    window.addEventListener("message", onMessage);
    scheme.addEventListener("change", onScheme);
    // The widget opens with `ui/initialize` and does not repeat it, so the
    // frame is only pointed at it once something is listening.
    if (frame.current && !frame.current.src) frame.current.src = "/demo";
    return () => {
      window.removeEventListener("message", onMessage);
      scheme.removeEventListener("change", onScheme);
    };
  }, [song]);

  return (
    <div className="card" data-inactive={inactive || undefined}>
      <iframe ref={frame} title={`A piano for ${song.title}`} style={height ? { height } : undefined} />
    </div>
  );
}
