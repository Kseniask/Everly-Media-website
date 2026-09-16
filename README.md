# Everly Media — Wedding Videography Website

Static, single-page marketing site for Everly Media (Pavlo's wedding videography business), Vancouver, BC.

## Structure

- `index.html` — the whole site (markup, CSS, and JS all in one file)
- `images/` — portfolio photos used as card backgrounds and posters
- `videos/` — short preview clips that play inline on each film card

## Running locally

No build step. Open `index.html` directly in a browser, or serve the folder:

```
python3 -m http.server 8000
```

then visit http://localhost:8000

## Deploying

This is a plain static site — it can be hosted as-is on GitHub Pages, Netlify, Vercel, or any static file host.
