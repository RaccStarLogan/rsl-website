# RaccStarLogan Website

![Logo](https://raccstarlogan.com/headerlogo.svg)

This is the source code for my personal site: [raccstarlogan.com](https://raccstarlogan.com), hosted on [Cloudflare](https://www.cloudflare.com).

It serves as my little hub for art, music, characters, and whatever else I feel like putting online.

## ⚠️ WARNING ⚠️

- This repository gives you direct access to any files on this website, which may include sensitive and/or adult content.
- Also this code is like really really bad. I suck at coding. Please help.
- Viewer discretion is advised.

## What’s Inside
- Built with Astro for static site generation
- Pages for my characters, commissions, portfolio, and other projects
- Some fun extras

## Running Locally
Not sure why you'd want to do this, but here's how:

```bash
git clone https://github.com/RaccStarLogan/rsl-website.git
cd rsl-website
npm install
npm run dev
```

This will start the dev server at `localhost:4321`.

## Project Structure

Inside of this Astro project, you'll see the following folders and files:

```
/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   └── style.css
└── src/
    ├── assets/
    ├── components/
    │   └── Announcement.astro
    ├── layouts/
    │   └── BaseLayout.astro
    └── pages/
        ├── index.astro
        └── links.astro
...so on and so forth.
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

Components are in `src/components/`, layouts in `src/layouts/`, and static assets in `public/`.

## Commands

All commands are run from the root of the project:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |

Thank you for taking the time to look in here! If you notice any issues, feel free to let me know through an [Issues report](https://github.com/RaccStarLogan/rsl-website/issues).

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/C0C1F3HIY)
