# ARPIK.AI 0.2 — complete free-tier deployment package

This package contains the ARPIK.AI 0.2 frontend, the newspaper-royal Flashcards study archive, a secure Google Gemini API proxy, a health endpoint, and Vercel deployment configuration.

## Package contents

- `index.html` — ARPIK.AI 0.2 website, original tools retained, new interactive Flashcards workspace, and royal lesson-card export.
- `config.js` — public API endpoint selector. It contains no credentials.
- `api/chat.js` — server-side Gemini proxy. The Gemini key is read only from the server environment.
- `api/health.js` — safe deployment check; reports whether the secret exists but never returns it.
- `vercel.json`, `package.json` — deployment metadata.
- `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — installable PWA shell and offline static assets.
- `.env.example`, `.gitignore` — safe configuration template and secret exclusions.

## Important: the string previously shared

`gen-lang-client-0505143072` is formatted like a Google AI Studio / Google Cloud project ID, not the API key itself. Use this ID to identify/select your project in Google AI Studio → API Keys → Create API key → choose the existing project. Then copy the separately generated API key and add that key only as `GEMINI_API_KEY` in Vercel. The project ID alone cannot authenticate API calls, so it is not placed in the website code. New keys created in AI Studio are authorization keys; follow Google's current key instructions. Keep the actual key private.

## Recommended deployment: host the complete app on Vercel

1. Extract this ZIP and import the folder/repository into Vercel.
2. Select the **Other** framework preset. No build command is needed; Vercel detects `api/*.js` functions.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `GEMINI_API_KEY` — your actual Gemini API key from Google AI Studio (secret; never paste it into code or chat).
   - `GEMINI_MODEL` — `gemini-3.5-flash-lite` (fast, cost-conscious default).
   - `ALLOWED_ORIGINS` — `https://arpitprk89.github.io` (add any other exact frontend origins, comma-separated).
4. Deploy. The website and `/api/chat` then share the same Vercel origin; the API automatically permits same-origin requests.
5. Test `https://YOUR-PROJECT.vercel.app/api/health`. It should return `configured: true` once the environment variable is set.
6. Open the site and test Talk, Reflect, Decide and Flashcards → Create with ARPIK.AI.

## Keep GitHub Pages as the website (optional)

1. Deploy this same package to Vercel as the API project.
2. Copy the Vercel API URL, for example `https://YOUR-PROJECT.vercel.app/api/chat`.
3. Edit `config.js` and set:
   `window.ARPIK_API_URL = "https://YOUR-PROJECT.vercel.app/api/chat";`
4. Add the updated `index.html` and `config.js` to the GitHub Pages repository. This package now includes its own `manifest.webmanifest`, `sw.js` and app icons; you can replace those too.
5. Set Vercel `ALLOWED_ORIGINS` to the exact GitHub Pages origin `https://arpitprk89.github.io` (not a page path).

## Flashcards

- Generate 5, 10 or 15 cards from a topic with Gemini.
- Flip, next/previous, shuffle, mark known, mark for review, print/save as PDF.
- Add manual cards.
- Decks stay in this browser's local storage; they are not uploaded to ARPIK's server.
- Saved lesson cards export with an old-newspaper paper texture and the “CREATED BY ARPIK.AI” imprint.

## Security and privacy

- Never put `GEMINI_API_KEY` in `index.html`, `config.js`, GitHub, a screenshot, or a public message. Add it only in Vercel Environment Variables.
- The API endpoint has a basic per-instance rate limit, message-size limits and a configurable origin allowlist. This is not a distributed abuse-prevention system; monitor usage and rotate a key if it is exposed.
- Google says Gemini API requests authenticated by keys should be secured and kept server-side. Check the latest Google AI Studio terms and free-tier limits before launch. Free-tier access is limited and is not unlimited uptime or unlimited usage.
- Avoid collecting passwords, government IDs, health data or other sensitive personal information in chat.

## Local preview

Open `index.html` directly for the local UI. Local storage/manual Flashcards work, but Gemini features need a deployed `/api/chat` endpoint and a valid server-side key. Browsers may restrict some features when opening a file URL; preview from a local static server for the best result.
