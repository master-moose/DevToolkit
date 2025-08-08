# Dev Toolkit

A zero-backend, static, in-browser collection of useful developer utilities. Works offline (via Service Worker) and is ideal for GitHub Pages.

## Features
- Code Prettifier (Prettier via CDN)
- Color Palette Generator (random and complementary)
- SQL ID Formatter (IN (...), optional quotes)
- Live Markdown WYSIWYG (Marked + DOMPurify)
- UUID v4 Generator
- String Case Converter
- Unix Timestamp ↔ Date Converter
- JSON Prettifier / Minifier

## Tech Stack
- Pure HTML/CSS/JS
- Tailwind CSS via CDN
- Hash-based SPA routing
- Service Worker for offline caching (including CDN assets after first load)

## Structure
```
DevToolkit/
  index.html
  sw.js
  assets/
    css/styles.css
    js/{utils.js, app.js, tools.js}
    icons/favicon.svg
```

## Getting Started
- Open `index.html` in your browser. Everything runs locally.
- Optional: use a simple static server for local dev (e.g., VSCode Live Server). Not required.

## Deploy to GitHub Pages
1. Create a new GitHub repository and push this folder.
2. In GitHub repo Settings → Pages → Source: `Deploy from a branch`, select `main` and `/ (root)`.
3. Save. Your site will be live at `https://<user>.github.io/<repo>/`.

If deploying to a subpath, links are relative by default. Service Worker is registered from the site root.

## Buy Me a Coffee / AdSense
- Update the BuyMeACoffee URL in `index.html`.
- For AdSense, replace the placeholder block in the Home sidebar with your snippet.

## SEO & PWA
- Minimal SEO meta tags included in `index.html`.
- Favicon at `assets/icons/favicon.svg`.
- Service Worker `sw.js` caches core files on install and attempts to cache CDN assets after first use.

## Notes
- Tailwind is via CDN; minimal custom styles live in `assets/css/styles.css`.
- Tools logic is in `assets/js/tools.js`. Shared utilities in `assets/js/utils.js`.
- No backend, no build step.

## License
MIT