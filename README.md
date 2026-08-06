# arjun-rajeev

> IAM / IGA Senior Security Analyst — SailPoint IdentityIQ. Single-file, terminal-themed personal portfolio.

**Live site:** `https://arjunrajeev7.github.io/`  <a href="https://arjunrajeev7.github.io/">Link</a>

![Social Preview](./social-preview.gif)

---
 
## Overview

A single-page portfolio built for an Identity & Access Management / Identity Governance security profile, styled as a black-and-white terminal — boot sequence on load, live CLI-style spinners, monospace typography throughout, and bracketed section labels (`[ ABOUT ]_`).

No build step, no dependencies to install. It's one static HTML file.

## Features

- **Boot sequence intro** — a typed terminal log (`mounting sailpoint iiq modules... [ok]`) plays once per page load, skippable by clicking anywhere, and automatically disabled for users with reduced-motion preferences enabled.
- **Live status console** — hero panel with CLI-style braille spinners simulating platform monitoring.
- **Fully responsive** — mobile nav collapses into a terminal-style dropdown.
- **Scroll reveal animations** via `IntersectionObserver`.
- **Sections:** About & Focus, Experience (timeline), Key Initiatives, Skills, Education & Achievements, Contact.

## Tech stack

| Layer | Choice |
|---|---|
| Markup | Semantic HTML5 |
| Styling | Vanilla CSS (Flexbox + Grid, CSS variables) |
| Fonts | [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (display), [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) (body) via Google Fonts CDN |
| Icons | [Font Awesome 6](https://fontawesome.com/) via CDN |
| JavaScript | Vanilla JS — no frameworks, no build tools |

## File structure

```
arjun-portfolio/
├── index.html      ← everything: markup, <style>, <script>
├── certifications.html ← certifications, badges.
├── favicon.ico          ← root level
├── favicon.png(x7)      ← root level
├── README.md
├── Badges  ← directory
├── Certs  ← directory
└── social-preview.gif

```

`index.html` must stay at the **repo root** — GitHub Pages resolves the root `index.html` as the site's home page.

## Run locally

No build step required. Either:

```bash
# just open it
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

or serve it properly (recommended, avoids any local-file quirks):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy with GitHub Pages

1. Push this repo to GitHub (public repo).
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Branch: `main`, folder: `/ (root)` → **Save**.
5. GitHub publishes the site at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Customization

| What | Where |
|---|---|
| Name, role, bio | `<section class="hero">` |
| Work experience | `<section id="experience">` timeline items |
| Key initiatives | `<section id="initiatives">` cards |
| Skills | `<section id="skills">` pill groups |
| Certifications / education | `<section id="education">` |
| Contact links | `<section id="contact">` and `<footer>` |
| Colors / fonts | CSS variables at the top of `<style>` (`--bg`, `--white`, `--disp`, `--body`, etc.) |

### ⚠ Pending links

The **Steam** and **YouTube** buttons (in both the Contact section and the footer) currently point to `href="#"` as placeholders. Replace both occurrences of each with real URLs, e.g.:

```html
<a href="https://steamcommunity.com/id/YOUR_ID" ...>
<a href="https://youtube.com/@YOUR_HANDLE" ...>
```

## Certifications.html

It's currently placeholder art (a certificate/hourglass icon per card). To swap in real badges:

Save your badge images somewhere like badges/sailpoint-isp.png
In certifications.html, find the 
```<i class="fa-solid fa-certificate"></i>``` inside each .badge-img-wrap and replace with 
```<img src="badges/sailpoint-isp.png" alt="...">```
(each card has an HTML comment right above it telling you the exact filename to use)
Same idea for PDFs — the href="certs/sailpoint-isp.pdf" links are already wired up, just add the actual PDF files at those paths

Added a small "View badges →" link next to the "Certifications" heading in index.html pointing to the new page, plus a ./recommendations nav entry.

To do on your end: commit certifications.html to the repo root, add the two CSS/HTML snippets above into your live index.html at the anchors described, and send me the real recommendation quotes when you're ready.

## Favicon.ico

Add these lines into the <head> of both index.html and certifications.html, right after your <meta name="description"> line:

```html
<link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
```

```Where to put the files in your repo:

arjun-portfolio/
├── favicon.ico          ← root level
├── apple-touch-icon.png ← root level
├── index.html
├── certifications.html
├── README.md
└── ...
```

Both files must sit at the repo root — same level as index.html — because browsers automatically look for favicon.ico at the root of a domain, and the href paths above are relative to that. If you nest them in a subfolder the link tags will still work but the automatic browser lookup won't.

## Favicon Cycle Through

The only reliable way to cycle through icons in a browser is with JavaScript — you load each favicon as a separate image file and swap the ```<link rel="icon">``` tag on a timer. This works consistently across Chrome, Firefox, Edge, and Safari.

Here's the exact code to add. Put it at the bottom of your ```<script>``` block in both index.html and certifications.html, just before the closing ```</script>``` tag:

```javascript
const favicons = [
  'favicon-v1.png',
  'favicon-v2.png',
  'favicon-v3.png',
  'favicon-v4.png',
  'favicon-v5.png',
  'favicon-v6.png',
  'favicon-v7.png'
];
let faviconIndex = 0;
const faviconLink = document.querySelector("link[rel='icon']") || (() => {
  const l = document.createElement('link');
  l.rel = 'icon'; document.head.appendChild(l); return l;
})();
setInterval(() => {
  faviconIndex = (faviconIndex + 1) % favicons.length;
  faviconLink.href = favicons[faviconIndex];
}, 800);
```

Rename your 7 files to match exactly: favicon-v1.png through favicon-v7.png, all at the repo root. Change the 800 (milliseconds) to taste — 600 is snappier, 1200 is more relaxed.

## License

Personal portfolio — feel free to fork the structure for your own use, but please swap out the content, name, and resume details before publishing.
