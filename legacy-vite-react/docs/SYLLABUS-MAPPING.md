# Syllabus ↔ Code Mapping (CS3111 Web Technologies)

## Unit II – React (implemented)
| Syllabus topic | Where in code |
|---|---|
| Component, JSX, render | `src/components/*.jsx`, `src/components/sections/*.jsx` |
| State (`useState`) | `Header.jsx`, `LoadingScreen.jsx`, `Gallery.jsx`, `ContactSection.jsx`, `App.jsx` |
| Lifecycle (`useEffect`, `useRef`, `useCallback`) | `LoadingScreen.jsx`, `CinematicOpening.jsx`, `SparkEffect.jsx` |
| Props / parent→child | `LoadingScreen onLoadComplete`, `CinematicOpening onComplete` |
| Child→parent communication | callbacks `handleLoadComplete`, `handleOpeningComplete` in `App.jsx` |
| Component composition | `App.jsx` composes sections via `sections/index.js` barrel |
| Component styling | per-component `.css` files + global `src/index.css` |
| Forms & events | `ContactSection.jsx`, `Header.jsx` |
| Conditional rendering | `App.jsx` (loading / opening / main) |
| Animation | `framer-motion` (`motion`, `AnimatePresence`, `useScroll`, `useTransform`, `useInView`) |

## Planned units (per SRS)
| Unit | Topic | Planned use |
|---|---|---|
| I | PHP / Laravel | Not used (stack is Java) |
| II | React Router, Redux | Protected routes, auth state |
| III | Servlets & JSP | Auth, orders, production APIs; JSP staff views; sessions, cookies, JDBC |
| IV | Spring Boot | Optional REST layer |
| V | Advanced React | Hooks, performance, TypeScript |
| VI | Node.js | Not used |
