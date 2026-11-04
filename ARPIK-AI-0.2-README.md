# ARPIK.AI 0.2 — Your Secret Friend

**A student-built reflection, decision-support and study companion by Arpit Pareek.**

ARPIK.AI is designed to help students pause, reflect, think through choices, build better study habits and discover education opportunities. Version **0.2.0** brings a refreshed brand experience, a royal newspaper-style Flashcards workspace, an Opportunities directory and a secure server-side connection to Google Gemini.

> **Project documentary:** [Watch the ARPIK.AI documentary — English / Hindi](https://arpitprk89.github.io/Arpik.ai-documentary/)
>
> **Source repository:** [github.com/arpitprk89/arpik.ai](https://github.com/arpitprk89/arpik.ai)

---

## What is included in version 0.2?

| Workspace | What it is for |
| --- | --- |
| **Reflect** | A guided space to write about a situation, understand what happened and turn reflection into a practical next step. |
| **Talk** | A conversational companion powered by Google Gemini through the ARPIK.AI server. It is designed to respond in the user's language. |
| **Flashcards** | Create study decks with Gemini or add cards manually. Flip cards, move between questions, shuffle, mark cards as known or needing review, save decks and print them. The visual design uses an old-newspaper / royal archive theme with a **Created by ARPIK.AI** imprint. |
| **Opportunities** | Browse a curated directory of India, abroad and global scholarships, programmes, courses, internships and career resources. Search and save listings, then open the linked official source to confirm details. |
| **Decide** | Work through a decision in a more structured way instead of rushing to an answer. |
| **Growth** | Keep track of personal goals and progress. |
| **Feedback** | Send feedback about the project. |
| **Explore ARPIK.AI** | Read about the project and open the documentary and related project pages. |

### Important about opportunities

Listings are discovery links, **not a promise that applications are currently open or that a student is eligible**. Deadlines, age limits, country rules, fees and selection criteria change. Always read the current notice on the programme's official government or university website before applying. Never pay an unofficial agent to secure a scholarship or placement.

---

## How ARPIK.AI works

ARPIK.AI 0.2 has a browser interface and a small server-side API:

1. **The website** — `index.html` displays the ARPIK.AI workspaces and handles the interface.
2. **API address setting** — `config.js` tells the browser where the chat API lives. Leave it blank when the website and API are hosted together on the same Vercel domain. For a GitHub Pages frontend, set it to the full Vercel `/api/chat` URL.
3. **Secure Gemini bridge** — `api/chat.js` receives the chat request, checks the origin and request size, applies a best-effort per-instance request limit, and sends the prompt to Google's Gemini `generateContent` endpoint.
4. **Private API key** — the server reads `GEMINI_API_KEY` from Vercel Environment Variables. The key is never meant to be placed in `index.html`, `config.js` or any public GitHub file.
5. **Health check** — `api/health.js` reports whether the server has a Gemini key configured. It returns a yes/no configuration status, not the key itself.
6. **Local study storage** — saved Flashcards decks and known/review status are stored in the current browser's `localStorage`. They are not synced to another device or uploaded to an ARPIK.AI account.
7. **PWA shell** — `manifest.webmanifest`, `sw.js` and the app icons support installation and caching of selected static app files. Gemini features still need an internet connection.

### Request flow

```text
Student's browser
      |
      |  message / flashcard-generation prompt
      v
ARPIK.AI /api/chat  (Vercel Function)
      |
      |  reads GEMINI_API_KEY privately on the server
      v
Google Gemini API
      |
      |  generated text
      v
ARPIK.AI returns the response to the browser
```

**Privacy note:** Talk and AI-generated Flashcards send the text needed for the request to Google Gemini through the server. Do not enter passwords, bank details, government ID numbers, private medical information or anything you would not want processed by an online AI service. Google's terms, data handling and free-tier policies apply.

---

## Package structure

```text
ARPIK-AI-0.2/
├── index.html                 # Main ARPIK.AI 0.2 website
├── config.js                  # Public API URL setting (no secrets)
├── api/
│   ├── chat.js                # Secure Gemini proxy (server-side)
│   └── health.js              # Non-secret API configuration check
├── vercel.json                # Vercel Function configuration
├── package.json               # Project metadata and Node.js requirement
├── .env.example               # Environment-variable template (placeholder only)
├── .gitignore                 # Keeps local secrets and build files out of Git
├── manifest.webmanifest       # PWA metadata
├── sw.js                      # Static app-shell service worker
├── icon-192.png               # PWA icon
├── icon-512.png               # PWA icon
└── apple-touch-icon.png       # Apple home-screen icon
```

---

## Setup and deployment

### Before you start

You need:

- A GitHub account and this repository: [arpitprk89/arpik.ai](https://github.com/arpitprk89/arpik.ai)
- A Vercel account: [vercel.com](https://vercel.com/)
- A Google AI Studio account: [aistudio.google.com](https://aistudio.google.com/)
- A Gemini API key created in Google AI Studio.

The project is configured for **Node.js 20 or later**. No frontend build step or third-party npm package is required by this package.

### Step 1 — Put the files in the correct folder

Extract the ZIP. Open the `ARPIK-AI-0.2` folder and upload **the contents of that folder** to the root of your GitHub repository. The repository root should directly contain `index.html`, `config.js`, `api/`, `vercel.json` and `package.json`.

Do not accidentally place the files one extra folder deep. If you intentionally keep the nested folder, set Vercel's **Root Directory** to `ARPIK-AI-0.2` during project setup.

Commit the changes to your production branch (usually `main`). Keep a backup of the previous website before replacing it.

### Step 2 — Create or copy a Gemini API key

1. Open [Google AI Studio — API keys](https://aistudio.google.com/api-keys).
2. Select the correct Google AI Studio project, or create a project/key pair.
3. Create or copy the **API key**. A project ID and an API key are different things; the project ID alone cannot authenticate a Gemini API request.
4. Keep the actual key private. Do not paste it into GitHub, HTML, JavaScript, screenshots or a public message.

### Step 3 — Import the GitHub repository into Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard) and choose **Add New → Project**.
2. Import `arpitprk89/arpik.ai` from GitHub.
3. Set the Root Directory to the folder that directly contains `index.html` and `api/` (normally the repository root).
4. Choose **Other** as the Framework Preset if Vercel asks. Leave Build Command and Output Directory empty unless your Vercel setup specifically requires a value.
5. Add the environment variables below before deploying (or add them in Project Settings afterwards and redeploy).

### Step 4 — Add the server environment variables

In Vercel, open **Project → Settings → Environment Variables** and add:

| Name | Value | Required? |
| --- | --- | --- |
| `GEMINI_API_KEY` | Your actual Google AI Studio API key | **Yes** |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Optional; this is the package default |
| `ALLOWED_ORIGINS` | `https://arpitprk89.github.io` when using GitHub Pages; use your exact frontend origin | Needed for a separate frontend origin |

For a website hosted on the **same Vercel domain** as its API, same-origin requests are accepted automatically by this code. You can leave `ALLOWED_ORIGINS` unset unless you need to allow a separate frontend domain. Do not use `*` for a public production site.

After changing environment variables, create a **new deployment / Redeploy**. Vercel does not apply changed environment variables to deployments that already exist.

### Step 5 — Deploy and check the API

Once deployment finishes, open this address in a browser:

```text
https://YOUR-PROJECT.vercel.app/api/health
```

A correctly configured deployment returns JSON similar to:

```json
{
  "app": "ARPIK.AI",
  "version": "0.2",
  "provider": "Google Gemini",
  "configured": true,
  "model": "gemini-3.5-flash-lite"
}
```

The `configured` field should be `true`. This endpoint never displays the API key. If it says `false`, check the spelling of `GEMINI_API_KEY`, confirm that it is enabled for the Production environment, save it and redeploy.

Then open your deployed website and test **Talk** and **Flashcards → Create with ARPIK.AI**. Manual Flashcards can be used without Gemini; AI generation cannot.

---

## Optional: keep GitHub Pages as the frontend

Use this option only if you want the public website to stay on GitHub Pages while Vercel runs the Gemini API.

1. Deploy the repository to Vercel using the steps above. This provides the API endpoint, for example `https://YOUR-PROJECT.vercel.app/api/chat`.
2. In the GitHub Pages copy of `config.js`, set the API address to your real Vercel endpoint:

   ```js
   window.ARPIK_API_URL = "https://YOUR-PROJECT.vercel.app/api/chat";
   ```

3. In Vercel, set `ALLOWED_ORIGINS` to the exact GitHub Pages **origin** (not the page path):

   ```text
   https://arpitprk89.github.io
   ```

   If you use a custom domain too, add its origin separated by a comma.

4. Commit the updated `config.js` to GitHub. Keep the frontend files (`index.html`, `config.js`, `manifest.webmanifest`, `sw.js` and app icons) together in the GitHub Pages publishing folder.
5. Redeploy Vercel after changing `ALLOWED_ORIGINS`, then test Talk and AI Flashcards on the GitHub Pages website.

GitHub Pages only hosts the static frontend. It does **not** run the `api/` Node.js server functions; those run on Vercel.

---

## Configuration reference

### `config.js`

- Same Vercel domain for frontend and backend: leave the setting as `window.ARPIK_API_URL = window.ARPIK_API_URL || "";`.
- Separate GitHub Pages frontend: set `window.ARPIK_API_URL` to the full Vercel `/api/chat` URL.

### `.env.example`

This is a template only. It contains a placeholder, not a usable key. Add the real values in Vercel's Environment Variables dashboard. Never commit a real `.env` file.

### Gemini model

The package default is `gemini-3.5-flash-lite`. You can select another model supported by your Google AI Studio project by changing `GEMINI_MODEL` in Vercel. Check the official model list before changing it.

---

## Known limits

- Gemini free-tier access has rate limits and usage rules; it is not unlimited. Availability and quotas can change by model, region and account. Review Google's current pricing and rate-limit pages.
- The API's in-memory rate limiter is **best-effort per serverless instance**. It is not a global quota, login system or complete abuse-prevention service.
- There is no user account or cloud sync for Flashcards in this version. Decks are saved in the browser that created them. Clearing browser site data can remove them; use print/PDF for a separate copy.
- Offline caching covers selected static files only. Gemini requests, opportunity links and other online services need a network connection.
- The opportunities directory is a starting point for discovery. Confirm current dates and eligibility with the official programme provider.
- The feedback form uses an external form service configured in the frontend. Review that provider's terms and privacy information before submitting personal information.

---

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `/api/health` returns `configured: false` | Add `GEMINI_API_KEY` in Vercel for the correct environment, save and redeploy. |
| Talk or AI Flashcards says it cannot connect | Confirm the Vercel deployment is live, check `/api/health`, and make sure `config.js` points to the correct API URL. |
| Browser shows a CORS / origin error | Set `ALLOWED_ORIGINS` to the exact frontend origin (scheme + hostname, no page path), then redeploy. |
| API returns a quota / rate-limit message | Wait and retry later; review Gemini usage, model access and quota in Google AI Studio. |
| Manual Flashcards work but AI creation does not | Manual cards are local; AI creation needs a working Gemini API and server key. |
| New environment value seems ignored | Trigger a fresh Vercel deployment. Environment changes do not modify old deployments. |
| Updated website is not visible on GitHub Pages | Check the repository's **Settings → Pages** publishing branch/folder and confirm the latest commit is in that source. |

---

## Official documentation and useful links

### ARPIK.AI project

- [ARPIK.AI documentary (English / Hindi)](https://arpitprk89.github.io/Arpik.ai-documentary/)
- [ARPIK.AI GitHub repository](https://github.com/arpitprk89/arpik.ai)
- [Project story and projects](https://arpik-ai-story.vercel.app/)
- [Meet Arpit — portfolio](https://who-is-arpit.vercel.app/)

### Google Gemini API

- [Google AI Studio — create/manage API keys](https://aistudio.google.com/api-keys)
- [Gemini API — getting started](https://ai.google.dev/gemini-api/docs/get-started)
- [Gemini API — API key security guidance](https://ai.google.dev/gemini-api/docs/api-key)
- [Gemini API — text generation / generateContent](https://ai.google.dev/gemini-api/docs/text-generation)
- [Gemini API — supported models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini API — pricing and free-tier details](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini API — rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Google AI terms and policies](https://ai.google.dev/gemini-api/terms)

### Hosting and web app

- [Vercel — import and deploy Git repositories](https://vercel.com/docs/git)
- [Vercel — environment variables](https://vercel.com/docs/environment-variables)
- [Vercel — manage environment variables and redeploy](https://vercel.com/docs/environment-variables/managing-environment-variables)
- [Vercel — Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js)
- [GitHub Docs — configure GitHub Pages publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [MDN — Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)

---

## Safety and responsibility

ARPIK.AI is a student-built reflection and learning companion. It is not a therapist, medical service, legal adviser, financial adviser or emergency service. AI-generated information can be wrong; independently verify important answers, deadlines and requirements. For an urgent safety concern, contact a trusted person and local emergency services.

**Keep your API key private.** If a key is accidentally published or shared, revoke it in Google AI Studio and create a new one.

---

*ARPIK.AI 0.2.0 · Your Secret Friend · Created by Arpit Pareek*
