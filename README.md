# Harrison Ford-Schultz site

React + Vite personal site for GitHub Pages.

The home page introduces Harrison Ford-Schultz as a computer engineering
student at Algonquin College and includes a shader-ready visual stage. The
projects page currently includes the
[MC Server Tracking Discord Bot](https://github.com/psmoxie/MC-Server-Tracking-Discord-Bot)
project.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Push to `main`. The GitHub Actions workflow in `.github/workflows/deploy.yml`
builds the Vite app and deploys `dist` to GitHub Pages.
