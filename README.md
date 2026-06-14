# math-shorts

A faceless YouTube channel pipeline that produces **memory-math** videos for
primary-school kids — "beat the clock" times-table drills and speed quizzes,
no camera, with clear child-friendly **voiceover** (the question read over the
countdown, the answer at the reveal) — and publishes them on a schedule with no
human in the loop.

The pipeline is built in independently-testable layers:

| Layer | Status | What it does |
| --- | --- | --- |
| **1. Question engine** | ✅ | Generates the curriculum + each video's questions, answers and timing. Pure logic, fully unit-tested. |
| **2. Video renderer** | ✅ | Turns a `VideoSpec` into a vertical (Shorts) MP4 — question reveal, countdown ring, answer. (Remotion) |
| **2b. Voiceover** | ✅ | Google Cloud TTS reads each question + answer; clips are content-hash cached. Silent if no key. |
| **3. Thumbnail + metadata** | ✅ | Auto-generates a 1280×720 thumbnail + title/description/tags, kept within YouTube's limits. |
| **4. Upload / scheduling** | ✅ | A date-driven content calendar + YouTube Data API uploader, runnable daily on GitHub Actions. |

Everything is **deterministic**: a video is fully reproducible from its `seed`,
and the day's video is decided by the date alone (the publishing job is stateless).

## Commands

```bash
npm install
npm test                 # 49 unit tests (engine, metadata, schedule, narration, tts)
npm run typecheck

npm run studio           # live preview / scrub in the browser
npm run render -- 7      # render the 7× table → out/times-table-7.mp4
npm run render -- 7 --silent   # render without voiceover
npm run thumbnail -- 7   # thumbnail PNG + metadata.json
npm run preview:spec     # print a VideoSpec
npm run preview:meta     # print the upload metadata

npm run produce -- --dry-run     # render today's scheduled video, skip upload
npm run produce                  # render + upload today's video (private)
npm run produce -- --date=2026-03-01 --visibility=unlisted
npm run produce -- 7             # force a specific table (ignores the schedule)
npm run produce -- --silent      # skip narration for this run
```

## Going live on YouTube (one-time setup)

Uploads use OAuth (an API key is **not** enough). Two important YouTube rules:

- **Until your Google project passes an API audit, uploaded videos are forced to
  `private`.** Private/unlisted automation works today; public needs the audit.
- Children's content is uploaded with `selfDeclaredMadeForKids: true` (set
  automatically in `src/youtube/upload.ts`).

Steps:

1. **console.cloud.google.com** → new project → enable **YouTube Data API v3**.
2. **OAuth consent screen** → add your channel's Google account as a **test user**.
3. **Credentials → Create OAuth client → Desktop app** → copy the client id/secret.
4. `cp .env.example .env` and fill in `YT_CLIENT_ID` / `YT_CLIENT_SECRET`.
5. `npm run auth` → approve in the browser → paste the printed `YT_REFRESH_TOKEN`
   into `.env`.
6. `npm run produce` → uploads today's video (private) to your channel. 🎉

## Voiceover (Google Cloud TTS)

Narration is optional — with no key, videos render silent. To enable it, in the
**same** Google Cloud project:

1. Enable **Cloud Text-to-Speech API**.
2. **Credentials → Create credentials → API key**; restrict it to that API.
3. Put it in `.env` as `GOOGLE_TTS_API_KEY` (and as a GitHub repo secret for the
   daily workflow). Optional: `TTS_VOICE` (default `en-US-Neural2-F`), `TTS_RATE`.

Clips are cached by content hash under `public/audio/` (gitignored), so re-renders
make no new API calls. Free tier easily covers daily use (~27k chars/month vs 1M free).
Use `--silent` (or `VOICE=off`) to skip narration for a run.

## Deploying the daily schedule

`.github/workflows/publish.yml` runs the pipeline daily at 08:00 UTC (and on
manual dispatch). Add `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`
as **GitHub repository secrets** and push — GitHub's runners render and upload
in the cloud, no machine of your own required. Edit the `cron` to change cadence.

## Defaults (easy to change)

- **Topic:** times tables · **Age:** 7–9 · **FPS:** 30 · **Theme:** candy
- Per question: 3s countdown + 2s reveal; 3s intro, 4s outro.
- **Calendar:** 2× … 12× tables, then 2 mixed quizzes, repeating (`src/schedule.ts`).
- **Quota note:** default YouTube API quota allows ~6 uploads/day.
