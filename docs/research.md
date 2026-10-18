# Research and source decisions

Reviewed 2026-10-18 for the standalone OwnPilot site.

## Product sources

- Product: https://github.com/ownpilot/OwnPilot
- Reviewed commit: `eb4c27f29d4d12778621a83e49cd673cd8b62239`
- GitHub latest release API: v0.8.3, stable (not draft/prerelease), published 2026-06-23.
- README, root package.json, SETUP.md, SECURITY.md, .env.example, docker-compose.yml, website source, UI public assets and screenshot inventory were reviewed.
- The root package and current release both identify v0.8.3. Some existing website pages contain older version/provider counts and environment-variable instructions. The new site avoids those counts and follows current source over stale website text.
- README's Docker example says no .env is needed, but current Compose reads `POSTGRES_PASSWORD` without a default. New installation examples explicitly copy .env.example, instruct the user to set a strong password, then build/start Compose.
- Source development starts **only** the postgres service before `pnpm dev`, avoiding a second gateway occupying port 8080.
- Provider credentials belong in Config Center. Security descriptions distinguish service-config encryption, OAuth token encryption, application/database ownership, and data sent to cloud services. No whole-database or end-to-end encryption claim is made.
- Product source requirements (Node 22+, pnpm 10+, PostgreSQL 16+) are separate from this website's Node/npm stack.
- Browser, voice, channels, coding CLIs, local providers, IoT, skills, extensions, MCP, Claw, Soul, crews and workflow relationships follow the README. External CLI authentication, paid API costs and tool permissions remain explicit.

## Brand provenance

- The current social card, `public/og.png`, uses the user's supplied original logo and platform overview as ImageGen references. Its blue/green palette and claw mascot replace the earlier orange/dark SVG sharing artwork. The full-resolution generated master and generation prompt are retained under `assets/`; the production PNG is 1200×630. All Open Graph and Twitter images reference `/og.png`; `social-card.png` remains as a compatibility copy.

- The root `ownpilot_logo.jpeg` contains the compass/shield/neural-core mark. The existing site's `logo.jpeg` and UI raster share that identity. The UI `logo.svg` and existing site's favicon use older alternate geometries, so they were not substituted for the compass mark.
- `public/brand-original.jpeg` is an unchanged copy of the original raster.
- `public/logo-mark.svg` is a clean reconstruction with the compass points, shield outline, P-shaped core, blue/green division and neural detail. It is identified as a reconstruction on the brand page; it is not represented as a recovered original vector.
- Screenshots in `docs/screenshots/inject-bug` demonstrate troubleshooting, not a clean current product overview. The site instead uses explicitly labeled interface/flow illustrations, consistent with the documented navigation and capabilities. No live session statistics are invented.
- The Oxog SVG paths were recovered from CobaltDB's delivered markup and client source. Original viewBox `0 0 200 130`, stroke widths (12/15), colors and path order are preserved. The observed draw uses 1.6s cubic-bezier(.6,.1,.2,1) with 0/.25/.5/.9s delays. A viewport observer triggers it once and reduced motion displays the complete mark.

## Design reference findings

| Reference       | Observed composition / behavior                                                                                                                                      | OwnPilot interpretation                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| dockrouter.com  | Direct two-part hero, real request-routing illustration with selectable destinations, labeled simulation, docs and installation tabs, disciplined technical captions | Selectable daily/research/code flows, factual labels, a readable route to documentation                                    |
| uwaserver.com   | Light editorial composition, unified-stack SVG, integration strip, product comparison, generous wide layout                                                          | One gateway visual, provider choice strip, alternating compositions rather than repeating cards                            |
| nothingdns.com  | Restrained typography and line work, strong ownership narrative, large network visual, thin section dividers                                                         | Quiet grid background, concise ownership copy and data-flow boundaries                                                     |
| cobaltdb.dev    | Product hero with technical illustration, source-first navigation, focused docs, appearance popover with three radio preview tiles                                   | Light/Dark/System preview selector, persistent preference and keyboard support                                             |
| guardianwaf.com | Product symbol integrated into a request flow, hierarchy between statement/description/actions, clear docs boundary                                                  | OwnPilot compass at the center of a meaningful model/tool/memory flow                                                      |
| cachestorm.com  | HTTP source and full server-rendered page accessible; Next.js static chunks, technical product presentation, SVG branding and source navigation                      | Static, locally bundled, inspectable content and shared footer alignment                                                   |
| anubis.watch    | Web fetch failed and direct HTTPS request failed certificate negotiation                                                                                             | No unverified animation, asset or page detail attributed to this reference; browser certificate warnings were not bypassed |

All accessible references were fetched directly. CobaltDB, DockRouter, UWAS, NothingDNS and GuardianWAF were additionally inspected in the browser. CobaltDB's appearance menu was opened: native radio choices Light/Dark/System, miniature preview cards, selected check, supporting copy. Geometry and animation were inspected in the delivered Oxog source/CSS.

The design uses Inter and JetBrains Mono with a blue/green palette derived from the original product mark. Dark mode uses deep navy surfaces and brighter blue, green and teal accents; light mode uses ice-blue surfaces, navy text and deeper accents for readable contrast. The shared OKLCH tokens drive buttons, diagrams, focus rings, code, theme previews and product illustrations. The brand page documents compass blue (#2585B2), signal green (#43B27D), deep navy (#102F49) and ice blue (#E4F0F5). OXOGNET retains its separate original pink/purple logo colors.

## Official implementation references

- https://nextjs.org/docs/app/guides/static-exports — `output: 'export'`, generated static pages and static-host limits.
- https://react.dev/versions and official npm registry metadata — stable React version and compatibility.
- https://www.typescriptlang.org/download/ and official npm registry metadata — stable TypeScript release.
- Official npm registry metadata for exact package versions and engine/peer requirements.
- GitHub releases API for actions/checkout v7.0.1, actions/setup-node v7.1.0, actions/configure-pages v6.0.0, actions/upload-pages-artifact v5.0.0 and actions/deploy-pages v5.0.1. Workflow references pin their returned tag commit SHAs.
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site — apex DNS and domain configuration.

## Publication boundary

Before implementation, `D:\Codebox\ownpilot.dev` was empty and was not a Git checkout. `ownpilot/ownpilot-site` did not exist. The authenticated user had admin membership in the ownpilot organization. Existing `ownpilot.dev` DNS pointed to GitHub Pages and its custom domain was assigned to the product repository's Pages configuration. Only the domain binding needs to move; the product source is not edited.
