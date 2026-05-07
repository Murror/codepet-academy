# Codepet Academy — Landing Page

Marketing site for the Codepet Academy 12-week cohort program. Static HTML + a Vercel serverless function that posts registrations through [Resend](https://resend.com).

## Stack

- Static HTML / CSS / JS (no framework)
- Vercel for hosting + serverless functions
- Resend for transactional email

## Project structure

```
.
├── index.html               # Landing page
├── api/
│   └── register.js          # Serverless function — receives form, sends email via Resend
├── pets/                    # Official Codepet pet PNGs
├── fonts/                   # Upheaval TT (display) + Open Sans (body)
├── codepet-wordmark.png     # Brand wordmark
├── package.json             # `resend` dependency
├── vercel.json              # Cache headers
└── .gitignore
```

## Local preview

Just open `index.html` in a browser. The form's `/api/register` POST won't resolve locally without `vercel dev` — see below.

To test the API locally with the actual Resend integration:

```bash
npm install
npx vercel dev
# then visit http://localhost:3000
```

## Deploy to Vercel

1. **Push this repo to GitHub** (see commands below).
2. Go to [vercel.com](https://vercel.com), click **Add New Project**, and import the repo from the Murror org.
3. Vercel auto-detects this as a static project with serverless functions. Just click **Deploy**.

## Resend setup

1. Sign up at [resend.com](https://resend.com).
2. Verify your sending domain (`codepet.academy`) — until then, the function uses Resend's `onboarding@resend.dev` sender, which only delivers to your verified email.
3. Create an API key under **API Keys → Create API Key**.
4. In Vercel: **Project → Settings → Environment Variables**, add:
   - `RESEND_API_KEY` — your Resend API key
   - `REGISTRATION_EMAIL` — destination address (default: `hello@codepet.academy`)
   - `REGISTRATION_SENDER` — once domain verified: `Codepet Academy <hello@codepet.academy>`
5. Redeploy (Vercel does this automatically when env vars change).

## Push to GitHub (Murror org)

The repo is already initialized locally with an initial commit. Run:

```bash
cd "codepet academy"
git remote add origin git@github.com:Murror/codepet-academy.git
git branch -M main
git push -u origin main
```

If you don't already have a `codepet-academy` repo under the Murror org:

```bash
gh repo create Murror/codepet-academy --private --source=. --push
```

(Requires the [GitHub CLI](https://cli.github.com) authenticated as a Murror member.)

## Files to update before launch

- [ ] In `api/register.js`, confirm `DESTINATION` (env var `REGISTRATION_EMAIL`) is the right inbox.
- [ ] After domain verification, set `REGISTRATION_SENDER` env var to your verified sender.
- [ ] Replace placeholder testimonial copy in `index.html` with real quotes after Cohort 1.
- [ ] Wire the "Apply" CTAs in the final section + pricing to the form (currently `href="#apply"` and `href="#"`).
- [ ] Replace the founder photo placeholder gradient with a real image of Astro.
