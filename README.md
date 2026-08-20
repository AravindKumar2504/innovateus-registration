# InnovateUS Registration — with Newsletter Opt-in

A working prototype of the [InnovateUS registration page](https://innovate-us.org/register)
with a new **weekly-newsletter opt-in** field, storing submissions in the Burnes Center's
headless CMS (Directus). Built as a take-home assignment for the Burnes Center Web Developer
intern role.

**Live demo:** _deployed on Netlify — link in the submission email_

## Stack

- **React 19 + TypeScript + Vite** — the JD lists React and/or Vue; I work in React/TS daily,
  so I can defend every line. (The production site is Nuxt/Vue — the markup and CSS here are
  written to match its rendered design 1:1.)
- **Netlify Functions** for the server side (`netlify/functions/`), deployed with the SPA
  from one repo via `netlify.toml`.
- **No UI framework/library** — hand-written, token-driven CSS mirroring the production
  design system (Libre Franklin / DM Serif, the InnovateUS blues, 6px-radius inputs).

## Architecture

```
Browser (React SPA)
  ├── GET  /api/catalog/series   ──▶ Netlify Function ──▶ innovate-us.org/api/catalog/series
  │        (same public API production uses; proxied because upstream sends no CORS headers)
  └── POST /api/register         ──▶ Netlify Function ──▶ Directus  POST /items/cw_intake
           (validates + whitelists every field; holds the API token server-side)
```

**Why a serverless proxy instead of posting to Directus from the browser?** A static page
would ship the Directus token in the JS bundle where anyone can read it. Here the token
lives only in a server-side env var (`DIRECTUS_TOKEN`), and the function re-validates
everything, so hand-crafted requests can't write arbitrary data either.

## Data mapping (matches the `cw_intake` field notes)

| Form input | Directus column | Semantics |
| --- | --- | --- |
| Email / First / Last | `email`, `first_name`, `last_name` | required, trimmed, ≤255 chars |
| Country | `country` | `United States` \| `Outside the United States` |
| State/Province | `state` | **only when country = United States**; USPS code, else `null` |
| Government question | `gov_org` | the **verbatim** option text |
| Level of government | `gov_level` | **only when `gov_org` is a "Yes…"** answer; optional |
| Series checkboxes | `workshop_series` | selected series titles, **comma-joined** |
| `?workshop=<id>` flow | `workshops` | `"<title> (<id>)"` — only in single-workshop mode; `workshop_series` then holds the parent series |
| **Newsletter opt-in (new)** | `newsletter` | required boolean, always sent |
| — | `consent_at` | **stamped server-side** (`new Date().toISOString()`) only when `newsletter` is `true`, else `null` — client clocks can't be trusted for consent records |

## Security decisions

- Directus token: server-side env var only; `.env` is gitignored (`.env.example` documents it).
- The function whitelists fields — nothing from the request body is forwarded verbatim.
- Enum validation against the exact production option strings; length caps; 20KB body limit;
  405 on non-POST; generic 502s to the client while details go to server logs.
- **Honeypot** anti-spam field (as on production): bots that fill it get a fake `200 OK`
  and nothing is written, so they can't learn they were filtered.
- Production also runs Cloudflare Turnstile; that requires a site key, so this prototype
  stops at the honeypot and notes Turnstile as the production hardening step.

## Accessibility

- Every control is labeled; the series checkbox group is a `fieldset` with a legend, and each
  checkbox has an accessible name (the production page announces them all as "on").
- Errors: `role="alert"` summary, per-field messages wired with `aria-describedby` +
  `aria-invalid`, and focus moves to the first invalid field.
- Success confirmation receives focus and is announced (`role="status"`).
- Skip-to-content link, visible focus rings, `prefers-reduced-motion` respected,
  keyboard-dismissable menus (Escape), sr-only "(required)" hints alongside the asterisks.

## Extra flows (from the schema notes / production behavior)

- `/register?workshop=prompting-lab-2026-09-11` — single-workshop registration with the
  production workshop-card design. Production resolves workshops from its Zoom Events backend
  (not public), so a small demo catalog ships in `src/lib/workshops.ts`; unknown ids fall back
  to the series flow with a notice.
- `/register?season=spring` — season filter observed on production links.
- Catalog failure → error state with retry; the series list itself comes live from the
  public API, never hardcoded.

## Known divergences from production

- Series display order: production sorts by data not exposed by the public API (likely next
  upcoming workshop date); this prototype keeps the API's order.
- The footer subscribe form points visitors to the registration form / production mailing
  list instead of silently accepting an email it can't store (the `cw_intake` collection
  requires name fields).
- Turnstile omitted (see Security).

## Run locally

```bash
npm install
cp .env.example .env   # paste the Directus token
npm run dev            # netlify dev: SPA + functions on http://localhost:8888
```

`npm run typecheck` type-checks the app, the functions, and the config;
`npm run lint` runs oxlint; `npm run build` produces the deployable `dist/`.

> Troubleshooting: on corporate machines with TLS interception (Zscaler etc.), the functions'
> outbound HTTPS needs a Node version that reads the system keychain (Node ≥ 23) or
> `NODE_EXTRA_CA_CERTS` pointing at the corporate CA bundle.

## Deploy (Netlify)

Connect the repo, set `DIRECTUS_URL` and `DIRECTUS_TOKEN` in Site settings → Environment
variables — `netlify.toml` handles the rest (build, functions, SPA fallback).

## AI usage

Built with Claude Code (Anthropic), as permitted by the assignment. The full process write-up
is in [docs/PROCESS.md](docs/PROCESS.md): how the tool was prompted (the live page's rendered
DOM, extracted CSS, and the Directus schema notes were used as the spec), every technical
decision above, and how results were tested — form-level, API-level (invalid enums → 422,
honeypot → no write), and end-to-end against the real collection with made-up emails,
verifying each stored row against the field notes.
