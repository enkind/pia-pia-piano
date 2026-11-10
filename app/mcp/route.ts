import { readFile } from "node:fs/promises";
import path from "node:path";
import { createMcpHandler } from "mcp-handler";
import {
  EXTENSION_ID,
  RESOURCE_MIME_TYPE,
  registerAppResource,
  registerAppTool,
} from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import { version } from "../../package.json";

export const runtime = "nodejs";

// Hosts cache UI resources by URI. Bump this whenever you ship a widget change.
const UI_VERSION = "1";
const RESOURCE_URI = `ui://pia-pia-piano/index.html?v=${UI_VERSION}`;

// Read per request rather than cached at module scope, so `vite build --watch`
// output is picked up without restarting the server.
const WIDGET_BUNDLE = path.join(process.cwd(), "widget", "dist", "index.html");
const RESOURCE_META = {
  ui: { csp: { connectDomains: [], resourceDomains: [] } },
};

async function readWidgetHtml(): Promise<string> {
  try {
    return await readFile(WIDGET_BUNDLE, "utf8");
  } catch {
    throw new Error(
      `Widget bundle not found at ${WIDGET_BUNDLE}. Run \`pnpm build:widget\`.`,
    );
  }
}

const handler = createMcpHandler(
  (server) => {
    registerAppResource(server, "app-widget", RESOURCE_URI, {}, async () => ({
      _meta: RESOURCE_META,
      contents: [
        {
          uri: RESOURCE_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: await readWidgetHtml(),
          _meta: RESOURCE_META,
        },
      ],
    }));

    registerAppTool(
      server,
      "open_piano",
      {
        title: "Open a piano",
        description:
          "Open a playable one-octave piano keyboard (C4 to C5) in the " +
          "conversation. The user plays it by tapping or clicking the keys.",
        inputSchema: z.object({}),
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
        _meta: {
          ui: { resourceUri: RESOURCE_URI },
          "openai/outputTemplate": RESOURCE_URI,
        },
      },
      async () => ({
        content: [{ type: "text", text: "A piano is open for the user to play." }],
      }),
    );
  },
  {
    serverInfo: { name: "pia-pia-piano", version },
    // Advertise the MCP Apps extension so UI-capable hosts negotiate it.
    capabilities: { extensions: { [EXTENSION_ID]: {} } },
  },
);

export const GET = handler;
export const POST = handler;
