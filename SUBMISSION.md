# Plugin directory submission

Worktracker for submitting Pia Pia Piano to the ChatGPT and Codex plugin
directory. Update the markers as tasks move.

Markers: `[ ]` not started · `[x]` done · `[!]` needs the maintainer

- Portal: <https://platform.openai.com/plugins>
- Docs: [Submit plugins](https://developers.openai.com/plugins/deploy/submission) ·
  [review requirements](https://developers.openai.com/plugins/deploy/app-review) ·
  [guidelines](https://developers.openai.com/plugins/app-guidelines)
- Prior art: `../better-response/SUBMISSION.md`, which went through the whole
  flow and records what the portal actually checks.

## Ready in the repository

- [x] One model-visible tool, `open_piano`, with all annotations, an
      `outputSchema`, and server `instructions`
- [x] UI resource with `ui.csp` (both lists empty), `ui.domain`, and
      `ui.prefersBorder`, at both the response and content level
- [x] Self-contained widget: no external fetches, no CSP origins
- [x] No auth, no accounts, no storage
- [x] `/privacy`, `/terms`, `/support` pages; support is the GitHub issue tracker
- [x] `/.well-known/openai-apps-challenge`, serving `OPENAI_APPS_CHALLENGE` as
      plain text and 404 while it is unset
- [x] `chatgpt-app-submission.json`: app info, tool justifications, five
      positive and three negative test cases
- [x] Directory and composer icons in `assets/submission/`
- [x] Skill `piano` with `agents/openai.yaml`
- [x] `pnpm test:client` passes against the local server

## Release and hosting

- [x] Public repository `enkind/pia-pia-piano`
- [x] Vercel projects `pia-pia-piano` and `pia-pia-piano-dev`
- [x] GitHub environments `development` and `production` with `VERCEL_TOKEN`,
      `VERCEL_PROJECT_ID`, and `MCP_URL`; `VERCEL_ORG_ID` at repository level.
      The CI token `pia-pia-piano-ci` expires on 2027-11-11.
- [x] `production` branch and releases v1.0.0 through v1.0.2
- [x] `pnpm test:client https://pia-pia-piano.vercel.app` passes (2026-11-11)

## Portal

- [x] Domain verified through `OPENAI_APPS_CHALLENGE` on the production project
- [x] MCP server configured; Scan Tools finds `open_piano`
- [x] Draft 1.0.2 uploaded from the release ZIP; metadata and skill checks
      report no findings
- [x] Test cases come from `extensions.com.openai.review` in
      `plugin.json`; the portal imports them only from the uploaded ZIP
- [x] Review information saved: all supported countries, the demo video at
      <https://pia-pia-piano.vercel.app/demo.mp4> (recorded in Codex), and
      release notes
- [!] Submit for review: the dialog asks for six attestations, which the
      maintainer confirms
