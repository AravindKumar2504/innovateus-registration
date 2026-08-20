# Process & decision write-up

_The ~300-word paragraph for the submission email. First person; details behind each
claim are in the [README](../README.md)._

---

I treated the existing page as the spec. Before writing code, I inspected
innovate-us.org/register in the browser and extracted its rendered DOM, page CSS, fonts, and
design tokens; I also found it consumes a public catalog API, so my prototype consumes the
same API (via a small proxy) instead of hardcoding the series list. I read the `cw_intake`
schema through the Directus API, and the field notes — "state only when country = United
States," "gov_org verbatim," "workshop_series comma-joined" — became my acceptance criteria,
including the `?workshop=<id>` single-workshop flow.

I chose React + Vite + TypeScript deployed on Netlify (both named in the job description;
the production site is Nuxt, but React is where I have daily professional depth), with
hand-written CSS mirroring the extracted design system. Security drove the architecture: a
static page would ship the Directus token in the bundle, so submissions go through a Netlify
Function that keeps the token in env vars, whitelists and re-validates every field, stamps
the newsletter `consent_at` timestamp server-side, and silently drops honeypot-caught bots.

My AI tool was Claude Code. I picked it because it can drive a real browser and terminal, so
I could prompt it with facts rather than guesses: the actual rendered page, the real CSS, the
actual schema. I directed it iteratively — extract the spec, build, then test — and had it
run an adversarial multi-agent review of its own code for correctness, security, and WCAG
issues before I accepted anything.

I tested at four levels: UI (conditional fields, error focus, keyboard use), a 16-test
vitest suite pinning the function's validation and exact Directus payload, API probes
(invalid enums rejected with 422s, honeypot writes nothing), and end-to-end against the
real collection with made-up emails, verifying every stored row against the field notes.
The final submission carries my real name.

---

_Word count: ~300._
