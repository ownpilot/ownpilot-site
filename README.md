# OwnPilot website

The independent English product site for [OwnPilot](https://github.com/ownpilot/OwnPilot), published from **ownpilot/ownpilot-site** to **https://ownpilot.dev** with GitHub Pages. The assistant's source, runtime, database and release process remain in the product repository.

## Develop

Use Node.js **26.12.0** (`.nvmrc`) and npm **12.2.0**. Install the matching Node release before installing npm globally.

```sh
npm install --global npm@12.2.0
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. All font files are bundled locally. The site requires no secrets, external model API, database or server-side runtime.

## Verify the production export

```sh
npm run typecheck
npm run format:check
npm run build
npm run check:export
npx playwright install chromium
npm test
npm run preview
```

`next build` produces `out/`, including directory-based routes, `CNAME`, `.nojekyll`, the sitemap, robots file and local assets. `check:export` checks every generated HTML file and its internal link/asset references. The preview server serves directory indexes and a real 404 response; it does not fall back to a single-page app.

Playwright covers all 17 content routes in both themes at 320, 375, 390, 768, 1024, 1280, 1440, 1920, 2560 and 3840px; theme persistence and system changes; blocked-storage fallback; mobile navigation; documentation search and empty results; direct navigation/refresh; workflow examples; keyboard tab controls; command clipboard feedback; integration filters and empty state; reduced motion; WCAG 2.2 A/AA checks on every content route and open controls; and Pages endpoints. Additional checks cover breakpoint boundaries, short landscape viewports, scrollbar reflow, font subsets and clipboard failure feedback. `SITE_TEST_URL` can target a deployed site instead of starting the local preview server. No product setup, API credentials or live provider execution is included in these website tests.

## Publish

`.github/workflows/pages.yml` pins verified stable action versions by commit SHA, installs the lockfile, type-checks, builds, validates exports and runs Chromium tests before publishing the `out/` artifact. Pull requests run the same verification without deploying. Enable **Settings → Pages → Source: GitHub Actions**. Push to `main`, or dispatch the workflow.

The custom domain must be configured as `ownpilot.dev` on **this** repository. GitHub only allows the domain to be assigned to one Pages site at a time; release its old assignment on `ownpilot/OwnPilot` before assigning it here. Preserve the old product repository and source; only the Pages domain binding changes. Enable HTTPS enforcement after GitHub provisions its certificate.

DNS for the apex should use GitHub Pages' official A records:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

For an optional `www` subdomain, point its CNAME to `ownpilot.github.io`. Consult [GitHub's current domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) before changing DNS. The apex already resolved to these four addresses during implementation.

## Design and content

- App Router server-rendered static pages, small client components for navigation, themes, search, filters, code copy and illustrative walkthroughs.
- Central layout tokens in `src/app/globals.css`; 1728px maximum content width, fluid gutters, readable article measure, explicit tablet/mobile layouts.
- Space Grotesk is the default interface and reading font. JetBrains Mono covers code, terminals and technical labels, including nested code elements. Local Latin/Latin Extended subsets cover English and Turkish; the main font is preloaded. Quicksand is reserved as a token and is not downloaded without an actual use. The exact OXOG reference retains its own licensed fonts.
- Blue/green brand palette with shared OKLCH theme tokens: navy surfaces in dark mode, ice-blue surfaces and navy text in light mode, accessible blue/green/teal accents, and coordinated focus rings, diagrams, code panels and app icons.
- One continuous, viewport-sized SVG compass field across every route and section. Local pointer reactions, capped click/tap waves, scroll parallax and pooled SVG objects run outside React. `src/lib/ambient-field.ts` centralizes counts, radii and lifetimes; brand theme tokens color the scene. Hidden/offscreen scenes and reduced motion suspend unnecessary movement. The mouse control stops pointer effects while calm ambient motion continues. No rendering dependency or Canvas is used.
- Dark, light and system themes; a pre-paint script prevents theme flash, localStorage persists the selection, native radios support keyboard selection, OS changes update system mode.
- Original vector-based flow diagrams; the compass SVG follows the product's existing raster identity. The original raster is also preserved for download.
- The OXOG studio area follows the requested Mammoth Engine reference: one full-width link, the original SVG geometry, licensed typefaces, reference copy and a staggered six-second drawing loop. It stops offscreen and with reduced motion; pages without JavaScript display it fully drawn.
- Product UI and workflows are **illustrations with sample data**, not screenshots of live agent activity. The source repository's available screenshots document troubleshooting and were not suitable for product marketing.
- No fake benchmarks, testimonials, customer counts, analytics or paid-service promises.

Edit `src/lib/docs.ts` for field guides and integrations; `src/lib/site.ts` for release information, commands and FAQs. Documentation source links pin a reviewed product revision. Re-review those sources when updating product claims; a new release does not automatically make every claim current.

## Assets

The canonical social sharing asset is `public/og.png` (1200×630). Its full-resolution, ImageGen-created artwork is preserved at `assets/og-master.png`; `assets/og.prompt.md` records the generation brief and supplied brand references. Run `npm run assets` to export the web-sized OG card, its `social-card.png` compatibility copy, and application icons. Keep the source and generated PNGs committed; normal website builds do not regenerate them. Every page points its Open Graph and Twitter metadata to `/og.png`. The export check verifies the image's dimensions, format, compatibility copy and every page's metadata. See [research notes](docs/research.md) for provenance and verification decisions.

## Versions verified on 2026-10-18

Node.js 26.12.0; npm 12.2.0; Next.js 16.4.2; React 19.3.1; TypeScript 7.0.2; lucide-react 1.59.0; Fontsource JetBrains Mono 5.3.0; Sharp 0.35.5; Playwright 1.64.1; axe-core Playwright 4.14.0; Prettier 3.9.10. Space Grotesk and the reference studio fonts are self-hosted with their OFL licenses. Dependency versions are exact, with `package-lock.json`. Product version: v0.8.3, distinct from the website stack.

## License

MIT. OwnPilot and other project names identify their respective projects. Integration names do not imply endorsement or partnership. The product's original mark is preserved as an OwnPilot brand asset; the Oxog mark is reproduced from the requested studio reference.
