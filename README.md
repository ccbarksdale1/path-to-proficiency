# Path to Proficiency

Math practice for students, with classes, teachers, class comparison, test import, and Scout the AI tutor.

- `public/index.html`: the app
- `netlify/functions/api/`: the school server (Netlify Functions + Netlify Blobs)

## Settings in Netlify (Site configuration → Environment variables)

| Name | What it does |
|---|---|
| `ANTHROPIC_API_KEY` | Turns on Scout the tutor and PDF test import. Get a key at console.anthropic.com. |
| `TUTOR_DAILY_LIMIT` | Optional. Most questions a student can ask Scout per day (default 40). |
| `AI_MODEL_FAST` / `AI_MODEL_SMART` | Optional. Models for the tutor and PDF reading (default claude-haiku-5-5 / claude-sonnet-5-5). |

After changing a variable, redeploy (Deploys → Trigger deploy).


## How the code is organized

- `public/index.html` is a small shell. Styles live in `public/css/app.css`.
- `public/js/` holds the app as 12 plain scripts that load in number order and share one global scope (01 grade 3 questions, 02 core, 03 home page, 04 student, 05 teacher, 06 fluency and games, 07 admin and tour, 08 reports and plans, 09 student extras, 10 more question makers, 11 science and ELA, 12 startup). Keep new code in the file for its area; anything that runs at load must only use what earlier files define.
- `netlify/functions/api/core.mjs` is the server; `public/arcade/` holds the learning games; `public/home/` holds the PTP Bridge family pages.

## Tests

Run `npm test` before every push.

- `node tests/server.test.mjs`: every server action checked against a pretend in-memory store (no installs needed).
- `python3 tests/pages.test.py`: a robot browser clicks through the sample school and the student demo (needs `pip install playwright` and `playwright install chromium`).
