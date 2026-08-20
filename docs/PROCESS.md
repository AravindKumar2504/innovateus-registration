# Process and decisions

I treated the existing page as the spec. Before writing code I inspected
innovate-us.org/register in the browser, pulled its rendered DOM, CSS, fonts, and design
tokens, and found that it loads its series list from a public catalog API. My prototype
consumes the same API through a small proxy instead of hardcoding the list. I read the
cw_intake schema through the Directus API, and the notes on each field ("state only when
country = United States", "gov_org verbatim") became my acceptance criteria, including the
?workshop=<id> single-workshop flow.

I chose React, Vite, and TypeScript on Netlify, all named in the job description. The
production site is Nuxt, but React is where I have daily professional depth, and I matched
the visual design with hand-written CSS from the extracted tokens. Security drove the
architecture: a static page would ship the Directus token in the bundle, so submissions go
through a Netlify Function that keeps the token in env vars, re-validates and whitelists
every field, stamps the newsletter consent_at timestamp server-side, and silently drops
honeypot-caught bots.

My AI tool was Claude Code. I picked it because it drives a real browser and terminal, so
I could prompt it with facts instead of guesses: the actual rendered page, the real CSS,
the actual schema. I worked iteratively (extract the spec, build, then test) and had it run
an adversarial multi-agent review of its own code for correctness, security, and
accessibility before I accepted anything.

I tested at four levels: the UI (conditional fields, error focus, keyboard use), a 16-test
vitest suite pinning the function's validation and exact Directus payload, API probes
(invalid enums rejected, honeypot writing nothing), and end to end against the real
collection using made-up emails, checking every stored row against the field notes. The
final submission carries my real name.
