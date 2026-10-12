# ASCEND Focus

Practice-based attention and mental discipline app, inspired by William Walker Atkinson's historical exercises.

See the [Master Blueprint](https://docs.google.com/document/d/1-9DXFFtHqUWGgSabES8yXlMARUYAB6MJi1TKX2lVkAw/edit) for curriculum, UX, privacy, community, and Codex instructions.

**Status:** exercise web app with private device-local journaling and an implemented Node/SQLite community backend. Community shows an offline draft mode until it can reach the backend; it is not a deployed public service.

Use Node 24+. Run `npm install`, `npm run typecheck`, `npm test`, and `npm run build`.
Start the backend with `npm run server`, and the frontend in another terminal with
`npm run dev`. Open `http://localhost:5173` to create an account and a circle.

See [community setup, permissions and limitations](docs/COMMUNITY.md).
The [source ledger](docs/ATKINSON-SOURCE-LEDGER.md) remains a partial extraction.


## Specification v2 and current audit

[Definitive specification v2](https://docs.google.com/document/d/16U1Rs7_o1CjWGCzHBDjXCB2-hjpxapimrF27x4Qhebk/edit)
is the target engineering contract, not proof of completed functionality.
See [document-access audit](docs/DOCUMENT-ACCESS-AUDIT.md),
[architecture package](docs/ARCHITECTURE-V2.md) and
[initial evidence matrix](docs/RESEARCH-COMPARISON.md). Complete v1/v2 snapshots are
under docs/sources. The source PDF is accessible; full transcription remains partial.

Solo practice now uses a foreground-only resumable session model, optional stages
and timer, safety acknowledgement, private comfort/usefulness and guarded journal
save/delete/export. Existing v1 journals remain readable. Storage failures retain
reflection and offer export; temporary unsaved practice requires explicit acceptance.
IndexedDB migration and complete offline PWA remain planned. Quiet mode defaults on.

Run `npm run test:practice` for ten dependency-free session/journal checks.
`npm run build`, `npx playwright install chromium`, then `npm run test:e2e` run actual
mobile-browser journeys and capture screenshots under test-results/screenshots.
CI uploads real-app-browser-evidence; screenshots are not substituted by mockups.
