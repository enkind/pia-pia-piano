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
import { MAX_NOTES, PITCH, songProblem } from "../../lib/song";
import { version } from "../../package.json";

export const runtime = "nodejs";

// Hosts cache UI resources by URI. Bump this whenever you ship a widget change.
const UI_VERSION = "5";
const RESOURCE_URI = `ui://pia-pia-piano/index.html?v=${UI_VERSION}`;

// The widget is one self-contained HTML file that fetches nothing, so the
// declared CSP needs no external origins. Read per request rather than cached,
// so `vite build --watch` output is picked up without restarting the server.
const WIDGET_BUNDLE = path.join(process.cwd(), "widget", "dist", "index.html");
const RESOURCE_META = {
  ui: {
    csp: { connectDomains: [], resourceDomains: [] },
    domain: `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "pia-pia-piano.vercel.app"}`,
    prefersBorder: true,
  },
};

const INSTRUCTIONS =
  "Pia Pia Piano opens a playable piano for a melody you write out note by note. " +
  "The user plays it at their own pace: the next key lights up and waits until " +
  "they press it. Write the melody only, one entry per key press, in scientific " +
  "pitch notation. Nothing comes back when they finish, so do not wait for a result.";

async function readWidgetHtml(): Promise<string> {
  try {
    return await readFile(WIDGET_BUNDLE, "utf8");
  } catch {
    throw new Error(
      `Widget bundle not found at ${WIDGET_BUNDLE}. Run \`pnpm build:widget\`.`,
    );
  }
}

const note = z.object({
  pitch: z
    .string()
    .regex(PITCH, "Use scientific pitch notation, such as C4, F#3, or Bb4.")
    .describe("The key to press, such as C4 (middle C), F#3, or Bb4."),
  lyric: z
    .string()
    .max(24)
    .optional()
    .describe("The syllable sung on this note, if the song has words."),
});

const song = z.object({
  title: z.string().min(1).max(120).describe("The song's name, shown above the keyboard."),
  notes: z
    .array(note)
    .min(1)
    .max(MAX_NOTES)
    .describe(
      "The melody in order, one entry per key press, repeated notes included. " +
        "Melody only, no chords. Keep it within three octaves; around C4 to C6 " +
        "suits most songs.",
    ),
});

const handler = createMcpHandler(
  (server) => {
    registerAppResource(server, "piano", RESOURCE_URI, {}, async () => ({
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
          "Open a playable piano in the conversation, set up to teach one melody. " +
          "The keyboard shows only the keys the song uses, the next key lights up, " +
          "and the user plays the song at their own pace, one key press at a time. " +
          "Use when the user wants to play, learn, or hear how a song goes on piano.",
        inputSchema: song,
        outputSchema: song,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
        _meta: {
          ui: { resourceUri: RESOURCE_URI },
          "openai/outputTemplate": RESOURCE_URI,
        },
      },
      async ({ title, notes }) => {
        const problem = songProblem(notes);
        if (problem) {
          return {
            isError: true,
            content: [{ type: "text", text: `${problem} Fix the notes and call open_piano again.` }],
          };
        }
        return {
          content: [
            {
              type: "text",
              text:
                `The piano is open with "${title}" (${notes.length} notes). The user ` +
                "plays it at their own pace, and nothing comes back when they finish. " +
                "Do not repeat the notes as text.",
            },
          ],
          structuredContent: { title, notes },
        };
      },
    );
  },
  {
    serverInfo: { name: "pia-pia-piano", version },
    instructions: INSTRUCTIONS,
    // Advertise the MCP Apps extension so UI-capable hosts negotiate it.
    capabilities: { extensions: { [EXTENSION_ID]: {} } },
  },
);

export const GET = handler;
export const POST = handler;
