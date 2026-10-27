# Jam Weddings

Astro migration of https://jam.mt/, with repository-owned content and local assets. No WordPress or CMS runtime. The source currently has one public page: `/`, with `#about`, `#portfolio`, `#services` and `#contact` anchors. Those URLs are preserved.

## Development

Node 22+ and npm:

```sh
npm ci
npm run dev
npm run build
npm run check:essential
```

The Astro development server serves the static pages. `/api/contact` is a Vercel Node function; use `vercel dev` for the complete local form integration. The default dev script listens on 127.0.0.1; the production deployment is public at the Vercel project URL.

## Content and media

- `src/data/site.ts`: navigation, contact details, service choices and field labels.
- `src/data/packages.ts`: accessible text transcription of the package artwork.
- `src/pages/index.astro`: the original page content and portfolio order.
- `public/assets/`: original logo, locally served images, responsive WebP copies, WOFF2 fonts, package artwork and wedding film.
- `docs/source-inventory.json`: source page and original media URLs.
- `vercel.json`: permanent redirects for legacy page aliases and downloaded WordPress media URLs, caching and security headers.

Package artwork is retained as supplied, including its original booking year, prices and conditions. Change artwork and text together. Original font files were downloadable from the source site; retain applicable font licences.

## Mailjet and secrets

The local `.env` file is gitignored and mode 600. Fill `MAILJET_API_KEY` and `MAILJET_SECRET_KEY`. The configured sender is `website@jam.mt`; the recipient is `info@jam.mt`. **The sender must be verified in the Mailjet account associated with these keys.** Never add `PUBLIC_` prefixes to credentials.

Required Vercel server environment variables, for production and preview:

- `MAILJET_API_KEY`
- `MAILJET_SECRET_KEY`
- `CONTACT_FROM=website@jam.mt`
- `CONTACT_TO=info@jam.mt`
- `FORM_SECRET`: independent random signing key, generated in the local `.env`.

Use `npm run env:sync` after filling `.env`; it sends only these five names to the linked Vercel project using the authenticated Vercel CLI. Values are sent through stdin and not printed. Deploy again after changing Vercel environment variables. The site is connected to GitHub for subsequent pushes to `main`.

The API validates required values, email, phone, calendar date, lengths and allowed services; rejects cross-origin submissions and honeypot values; requires an expiring HMAC-signed challenge and SHA-256 proof of work. It also has a best-effort per-IP warm-instance limit (five attempts per ten minutes), which is **not a shared serverless rate limit**. For sustained abuse, add a Vercel WAF rate-limit rule for POST `/api/contact` or an external shared limiter. No enquiry contents, visitor emails or credentials are logged. The visitor's email is `ReplyTo`, never the sender. Notifications include a branded HTML email and a plain-text alternative, with all contact details, selected services, wedding details and the note. User-entered values are escaped before inclusion in HTML; the template lives in `src/lib/enquiry-email.js`.

Missing credentials and Mailjet failures return explicit errors. Success is displayed only after Mailjet accepts the message; this does not verify inbox delivery. Essential checks mock Mailjet rather than sending email.

## SEO and performance

Homepage title, description, canonical, Open Graph, Twitter and ProfessionalService/WebSite/WebPage JSON-LD are populated. Section anchors are part of the homepage, not separate indexable pages. `sitemap.xml`, `robots.txt` and `llms.txt` use the final canonical domain, https://jam.mt. The custom 404 has noindex metadata and Vercel serves unknown paths with HTTP 404. API responses use no-store and noindex.

Responsive WebP images include each full-resolution original in their source sets. Photographs use quality 94; service artwork uses lossless WebP to preserve its lettering. Native source dimensions are recorded in `src/data/media.json`; the package originals are approximately 1190 × 842 pixels. Explicit dimensions, WOFF2 fonts, lazy image loading and small native scripts reduce transfer and layout shifts. The mobile menu animates as an overlay below the fixed-height 80px header and respects reduced-motion preferences. The local hero video loads automatically and plays muted on a continuous loop, matching the original website. It has no visible playback toggle. The Vimeo portfolio player loads only on request. Vimeo uses `dnt=1`. No PageSpeed score has been measured.

## Deployment and domain

GitHub: https://github.com/mikegauci/jam
Vercel: `mikegaucis-projects/jam-weddings` (mikegauci’s projects).

**Production domain cutover is on hold at the user's request. Do not attach or redirect jam.mt/www.jam.mt and do not change Cloudflare DNS until explicitly instructed to resume.** The Vercel deployment uses its own URL. jam.mt continues serving WordPress.

Before any future DNS switch: finish Mailjet setup and a controlled form check; inspect the desktop/mobile rendering; export the existing Cloudflare zone; identify A/AAAA/CNAME web records; confirm Vercel's current recommended targets. Preserve MX, TXT (SPF/DKIM/DMARC/verification), mail-related host records, and any mail server address depended on by MX records. Make only the needed web-record changes. Validate HTTPS, canonical routing and the 404 on the actual domain after cutover.

## Verification limits

One local production build and essential checks cover anchors, local asset references, metadata, SEO files, the noindex 404 and mocked form success/error/Reply-To. HTTP checks validate the live deployment and 404 separately. Browser automation was unavailable in this chat, so desktop/mobile screenshot comparison, touch interaction and visual fidelity have not been verified. Real Mailjet acceptance/delivery and mobile PageSpeed scores have not been tested.
