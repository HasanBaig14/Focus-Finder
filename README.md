# Focusflow

A full-stack task planner built with React, a Next.js-compatible Vinext server, Cloudflare Workers, Drizzle, and a persistent D1 SQL database. Sites provides private hosting and ChatGPT sign-in. D1 is used for the hosted deployment instead of PostgreSQL/MongoDB.

## Features

- Natural-language capture with editable structured suggestions.
- Optional OpenAI Responses API structured outputs; clearly labeled basic keyword parsing without a key.
- Create, edit, complete, reopen, delete, search, sort, and categorize tasks.
- Deterministic priority scheduling: overdue tasks first, then due date and priority, with lunch, breaks, workday limits, and overflow reporting.
- Day navigation, workday preferences, a focus timer, and JSON export.
- Per-user ownership checks for all database operations. SQL migrations applied at deployment.

## Run locally

Use Node >=22.13. `npm run install:ci`, `npm run db:generate`, and `npm run build`.
Apply the generated migration with:

```
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_blushing_wolfsbane.sql
```

Then `npm run dev`. Visit the printed local URL; the starter simulates sign-in only on loopback in development. The production build uses Sites authentication.

## AI configuration

Configure `OPENAI_API_KEY` as a server-side runtime secret using Sites, and optionally `OPENAI_MODEL` (default `gpt-4o-mini`). Never place the key in the browser bundle. Local secrets belong in an ignored `.dev.vars` file. Requests use the OpenAI Responses API with a strict JSON schema and `store:false`; input is limited to 4,000 characters. Model output is validated again on the server. AI failure is shown explicitly; it does not silently switch parsing modes.

Without a key, the app uses a limited keyword parser supporting one task per line or semicolon, numeric durations, ISO dates, today/tomorrow/weekdays, and common category keywords. Scheduling is deterministic in both modes. AI classification accuracy has not been benchmarked; do not claim 95% accuracy on a resume without a labeled evaluation set.

## Verification

`node --experimental-strip-types --test tests/planner.test.mjs`
`npx tsc --noEmit`
`npm run build`

## Limits

The schedule is a personal task plan, not a synced calendar. There are no calendar event imports, recurring tasks, push notifications, or background timer alarms. A focus timer needs the page to remain open. Dates and scheduling use the browser's local time. Tasks that cannot fit remain unscheduled. Exports include task data, not account settings. No external emails or calendar writes are performed.

## Verified build

Six planner unit tests pass, TypeScript checks pass, and the production build succeeds. A local production-Worker API smoke test verifies unauthenticated rejection, per-user isolation, create/edit/complete/delete behavior, and invalid input handling. Run it against `npm run start -- --port 8787` with `python3 tests/api-smoke.py`. These synthetic identity headers are for the loopback production preview only; hosted identity is injected by Sites.

Browser checks cover natural-language review, saved task creation, changed estimates after reload, completion persistence, schedule generation, and desktop/mobile layout. Live OpenAI calls remain unverified until an API key is configured.
