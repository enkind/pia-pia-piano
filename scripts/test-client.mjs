/**
 * Smoke-tests the MCP endpoint the way a real host would: connects over
 * Streamable HTTP as a UI-capable client, lists tools, calls the model-facing
 * tool with a good song and two bad ones, and reads the widget resource.
 *
 *   node scripts/test-client.mjs [base-url]
 */
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { EXTENSION_ID, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";

const base = (process.argv[2] ?? "http://localhost:3200").replace(/\/$/, "");
const url = new URL(`${base}/mcp`);

const client = new Client(
  { name: "pia-pia-piano-smoke-test", version: "0.1.0" },
  { capabilities: { extensions: { [EXTENSION_ID]: { mimeTypes: [RESOURCE_MIME_TYPE] } } } },
);

await client.connect(new StreamableHTTPClientTransport(url));

const pass = [];
const fail = [];
const check = (label, ok, detail) => (ok ? pass : fail).push(detail ? `${label} — ${detail}` : label);

console.log(`Connected to ${url}`);
console.log("Server:", JSON.stringify(client.getServerVersion?.()));

const caps = client.getServerCapabilities() ?? {};
check("server advertises MCP Apps extension", Boolean(caps.extensions?.[EXTENSION_ID]));
check("server sends instructions", (client.getInstructions?.() ?? "").length > 0);

// 1. `open_piano` is the whole model-facing surface.
const { tools } = await client.listTools();
const names = tools.map((t) => t.name);
const open = tools.find((t) => t.name === "open_piano");
check("open_piano is the only tool", names.length === 1 && Boolean(open), `tools=${names.join(", ")}`);
check(
  "open_piano points at a ui:// resource",
  open?._meta?.ui?.resourceUri?.startsWith("ui://"),
  `resourceUri=${open?._meta?.ui?.resourceUri}`,
);
check("open_piano declares an output schema", Boolean(open?.outputSchema));
check(
  "open_piano is annotated read-only and closed-world",
  open?.annotations?.readOnlyHint === true &&
    open?.annotations?.destructiveHint === false &&
    open?.annotations?.openWorldHint === false,
);

// 2. A playable song comes back as widget state.
const song = {
  title: "Mary Had a Little Lamb",
  notes: ["E4", "D4", "C4", "D4", "E4", "E4", "E4"].map((pitch) => ({ pitch })),
};
const result = await client.callTool({ name: "open_piano", arguments: song });
check("a playable song opens", !result.isError, JSON.stringify(result.content));
check(
  "the song reaches the widget",
  result.structuredContent?.notes?.length === song.notes.length &&
    result.structuredContent?.title === song.title,
);

// 3. Unplayable songs are refused with a reason the agent can act on.
const badPitch = await client.callTool({
  name: "open_piano",
  arguments: { title: "Typo", notes: [{ pitch: "H4" }] },
});
check("an invalid pitch is refused", badPitch.isError === true);

const tooWide = await client.callTool({
  name: "open_piano",
  arguments: { title: "Too wide", notes: [{ pitch: "C2" }, { pitch: "C6" }] },
});
check(
  "a melody wider than three octaves is refused",
  tooWide.isError === true && tooWide.content?.some((c) => /three octaves/.test(c.text ?? "")),
);

// 4. The referenced UI resource must be readable, real, and self-contained.
const read = await client.readResource({ uri: open?._meta?.ui?.resourceUri });
const content = read.contents?.[0];
const html = content?.text ?? "";
check("UI resource uses the MCP Apps MIME type", content?.mimeType === RESOURCE_MIME_TYPE);
check("UI resource is an HTML document", /<html/i.test(html), `${html.length} bytes`);
check(
  "UI resource declares an empty CSP",
  content?._meta?.ui?.csp?.connectDomains?.length === 0 &&
    content?._meta?.ui?.csp?.resourceDomains?.length === 0,
);

const external = [...html.matchAll(/<(?:script|link|img)[^>]*(?:src|href)="([^"]+)"/gi)]
  .map((m) => m[1])
  .filter((ref) => !ref.startsWith("data:") && !ref.startsWith("#"));
check(
  "UI resource is self-contained",
  external.length === 0,
  external.length ? `external refs: ${external.slice(0, 3).join(", ")}` : undefined,
);
check("UI resource synthesizes sound", /AudioContext/.test(html));

console.log("");
for (const p of pass) console.log(`  PASS  ${p}`);
for (const f of fail) console.log(`  FAIL  ${f}`);
console.log(`\n${pass.length} passed, ${fail.length} failed`);

await client.close();
process.exit(fail.length ? 1 : 0);
