# Youth for Sustainable Policy — Website

Static HTML site for YSP. No build step. Open `index.html` locally, or deploy any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages).

## Pages
- `index.html` — Home
- `about.html`, `team.html`, `chapters.html`
- `programmes.html` + six route pages
- `research.html`, `studios.html`, `mun.html`, `press.html`, `careers.html`
- `annual-reports.html`, `policies.html` + policy sub-pages

## Deploy

### Vercel (recommended)
1. Push this folder to a GitHub repo.
2. On vercel.com → **Add New → Project** → Import the repo.
3. Framework preset: **Other**. Build command: *(leave empty)*. Output dir: `./`.
4. Deploy. Custom domain in **Project → Settings → Domains**.

### GitHub Pages
Settings → Pages → Source: `main` / root.
