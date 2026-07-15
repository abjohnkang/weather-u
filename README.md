# WeatherU

A React weather app that displays current conditions and 7-day forecasts for major US college campuses.

## Features

- **College Selector** — Choose from 10 universities (UIUC, MIT, Stanford, Harvard, UCLA, UC Berkeley, Georgia Tech, UT Austin, UMich, Carnegie Mellon)
- **Current Weather** — Temperature, feels-like, humidity, wind speed, and weather description with emoji icons
- **Feels-Like Hint** — A practical, at-a-glance tip based on apparent temperature (e.g. "bring a jacket", "stay hydrated"), with precipitation warnings taking priority
- **24-Hour Chart** — Smooth temperature line for the next 24 hours, drawn as dependency-free inline SVG with a hover crosshair and tooltip
- **7-Day Forecast** — Daily highs/lows with weather icons in a scrollable layout
- **°F / °C Toggle** — Switch units instantly (no refetch); preference is saved to `localStorage`
- **Dark/Light Mode** — Automatically follows system preference

## Tech Stack

- React 19 + Vite
- Open-Meteo API (free, no API key required)

## Getting Started

```bash
npm install
npm run dev
```

Or use the convenience script, which installs dependencies if needed and restarts any server already running on the dev port:

```bash
./run_dev.sh
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## License

MIT
