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

### Switching the live site over (stage 4)

1. Owner page (`/#owner`) → **Get ready for districts** → **Check (dry run)**. Writes nothing.
2. **Copy now**. Copies today's school into its own store (`rh-bearden`) and adds the district, school and class codes to the registry. The old store is only read. Re-run any time before the switch; the card must say "The copy matches exactly."
3. On a weekend or break: run **Copy now** one last time, then set `MULTI_DISTRICT=on` and `HOME_SCHOOL=rh-bearden` in Netlify and redeploy. Teachers and students sign in once more (teachers type the school code once per device).
4. Undo: remove `MULTI_DISTRICT` and redeploy. The old store was never changed, so the site is exactly as it was before the switch (minus any work done after it). Keep the old store for 30 days.

### Sign in with Google (teachers)

- Uses only the public Client ID (in `netlify/functions/api/google.mjs` and `public/js/03-landing.js`; `GOOGLE_CLIENT_ID` in Netlify overrides it on the server). No client secret is used or stored.
- A teacher connects Google once from **Teachers → My account** while signed in with their code. After that, **Sign in with Google** on the sign-in screen finds their school and account.
- Multi-district: the registry keeps `gsub/<hash>` → school and teacher, so one Google account belongs to one teacher in one school. Google's ID and email are stored only in that school's own store.
- Google's script loads only after the teacher taps the button (no outside requests otherwise).
- Students don't use Google sign-in yet; districts must allow the app for student accounts first.

### Question quality audit

`python3 tests/audit.py [--grade 10] [--n 60]` generates many questions per skill and flags repeats, one answer coming up too often, wrong choices that are way off, and duplicate choices.
