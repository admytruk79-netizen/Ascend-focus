# ASCEND Focus

Practice-based attention and mental discipline app, inspired by William Walker Atkinson's historical exercises.

See the [Master Blueprint](https://docs.google.com/document/d/1-9DXFFtHqUWGgSabES8yXlMARUYAB6MJi1TKX2lVkAw/edit) for curriculum, UX, privacy, community, and Codex instructions.

**Status:** exercise web app with private device-local journaling and an implemented Node/SQLite community backend. Community shows an offline draft mode until it can reach the backend; it is not a deployed public service.

Use Node 24+. Run `npm install`, `npm run typecheck`, `npm test`, and `npm run build`.
Start the backend with `npm run server`, and the frontend in another terminal with
`npm run dev`. Open `http://localhost:5173` to create an account and a circle.

See [community setup, permissions and limitations](docs/COMMUNITY.md).
The [source ledger](docs/ATKINSON-SOURCE-LEDGER.md) remains a partial extraction.

