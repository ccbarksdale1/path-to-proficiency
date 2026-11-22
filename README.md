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
- `python3 tests/multi.test.py`: the multi-district walk-through (owner, school setup key, teacher sign-in, district admin, single-school mode).
- `npm run dev` or `npm run dev:multi`: a local copy of the site with the real server code and in-memory data (owner code `owner-dev`).

## Multi-district mode (off until the switch-over)

Set `MULTI_DISTRICT=on` in Netlify to turn it on. Each school then gets its own walled-off data store, grouped into districts in a small registry that holds no student data. The owner page (`/#owner`) creates districts, schools (with a one-time setup key for each school's first admin) and district admins. Teachers type their school code once per device; students still use only their class code. `HOME_SCHOOL` names the school whose admin reviews tutor applications and demo requests.
