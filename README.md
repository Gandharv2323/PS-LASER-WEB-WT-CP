# PS Laser – Unit of P S Enterprises

Web Technologies (CS3111) project: website and (planned) manufacturing management system for PS Laser, a sheet-metal fabrication business in Pune.

## Tech / modules used
| Module | Version | Purpose |
|---|---|---|
| react, react-dom | ^18.2 | Component UI, hooks |
| framer-motion | ^10.16 | Animations, scroll effects |
| vite | ^5 | Dev server and bundler |
| @vitejs/plugin-react | ^4.2 | JSX / fast refresh |

## Run on localhost
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the build
```
Requires Node.js 18+ (tested with Node 24) and Chrome.

## Project structure
```
src/
  main.jsx, App.jsx          entry + composition
  index.css                  global styles / tokens
  components/
    Header, LoadingScreen, CinematicOpening, SparkEffect, ...
    sections/                full-screen story sections (Hero → Contact)
public/                      images, gifs, video
docs/                        SRS summary, syllabus mapping
```

## Status
- Done: public website module (SRS M01) in React.
- Planned: Servlet/JSP/MySQL backend, auth, orders, production, ETA engine (see `docs/SRS-SUMMARY.md`).

See `docs/SYLLABUS-MAPPING.md` for the syllabus-to-code mapping.
