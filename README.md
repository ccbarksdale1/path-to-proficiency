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
