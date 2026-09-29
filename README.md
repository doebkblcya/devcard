# DevCard

Turn a public GitHub profile into a 1080 × 1920 developer card. One layout, four finishes: White, Black, Apple Minimal, and Liquid Glass.

## Run locally

Requires Node.js 20.19+.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. The Cloudflare Vite plugin runs the React app and API Worker together. Public GitHub data works without a token, subject to GitHub's unauthenticated request limit.

For a higher request limit, create `.dev.vars` in the project root:

```text
GITHUB_TOKEN=your_read_only_token
```

`.dev.vars` is ignored by Git. Use a token with access to public metadata only; the app never sends it to the browser.

## Deploy to Cloudflare Workers

```bash
npx wrangler login
npm run deploy
npx wrangler secret put GITHUB_TOKEN
```

The last command prompts for the token. The Vite build packages the SPA and Worker API for one Workers deployment. The `/api/*` path runs the Worker first, while static assets are served directly.

## How it works

`GET /api/github/:username` fetches the public user and owned repositories from GitHub REST API. It excludes forks and chooses three featured repositories by stars; when every repository has at most two stars, recent updates take priority. The browser renders the card and exports a PNG locally with `html-to-image`.

No account, database, cache, or server-side image renderer is used.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local app and Worker |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | Build and deploy to Workers |
