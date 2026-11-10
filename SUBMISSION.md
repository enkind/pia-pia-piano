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

## Needs the maintainer

- [!] Create the public GitHub repository `enkind/pia-pia-piano` and push
      `main`. Check commit authorship before making it public.
- [!] Create two Vercel projects, `pia-pia-piano` and `pia-pia-piano-dev`, so
      the hostnames match every manifest and page. Both returned 404 on
      2026-11-10, so they appear unclaimed.
- [!] GitHub environments `development` and `production`, each with
      `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, and `MCP_URL`; `VERCEL_ORG_ID` as a
      repository variable (see `enkind/.github` README).
- [!] Create the `production` branch and an initial tag so semantic-release
      has a starting point, then run the Release workflow.
- [!] In the portal: verify the domain by setting `OPENAI_APPS_CHALLENGE` on
      the production project and redeploying, run Scan Tools, import
      `chatgpt-app-submission.json`, upload the release ZIP and both icons.
- [!] Screenshots from a ChatGPT developer-mode render, not Codex or Cursor.
- [ ] Probe production with `pnpm test:client https://pia-pia-piano.vercel.app`
      before submitting.
