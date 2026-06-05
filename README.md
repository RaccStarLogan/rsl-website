# RaccStarLogan Website

![Logo](https://raccstarlogan.com/headerlogo.svg)

This is the source code for my personal site: [raccstarlogan.com](https://raccstarlogan.com), hosted on [Cloudflare](https://www.cloudflare.com).

It serves as my little hub for art, music, characters, and whatever else I feel like putting online.

## ⚠️ WARNING ⚠️

- This repository gives you direct access to any files on this website, which may include sensitive and/or adult content.
- Also this code is like really really bad. I suck at coding. Please help.
- Viewer discretion is advised.

## What's Inside
- Built with [Astro](https://astro.build/) SSR on [Cloudflare Pages](https://pages.cloudflare.com/)
- Portfolio powered by [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) with media hosted on [Cloudflare R2](https://developers.cloudflare.com/r2/)
- Character wiki with info boxes, galleries, and table of contents
- Portfolio gallery with thumbnail grid, year grouping, tag filters, and detail pages with prev/next navigation

## Running Locally

```bash
git clone https://github.com/RaccStarLogan/rsl-website.git
cd rsl-website
npm install
npm run dev
```

This starts the Astro dev server at `localhost:4321`. Note: the portfolio pages require a D1 database, so they won't load data in plain dev mode.

### Local Preview with D1

To test the full site with a local D1 database:

```powershell
./scripts/local-preview.ps1
```

This builds the site, seeds a local D1 instance, and starts `wrangler dev`.

## Commands

All commands are run from the root of the project:

| Command                          | Action                                         |
| :------------------------------- | :--------------------------------------------- |
| `npm install`                    | Installs dependencies                          |
| `npm run dev`                    | Starts local dev server at `localhost:4321`     |
| `npm run build`                  | Build production site to `./dist/`             |
| `./scripts/local-preview.ps1`   | Build, seed local D1, and start wrangler dev   |

Thank you for taking the time to look in here! If you notice any issues, feel free to let me know through an [Issues report](https://github.com/RaccStarLogan/rsl-website/issues).

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/C0C1F3HIY)
