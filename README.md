# PhishTrainer

PhishTrainer is an interactive training application that helps users identify
phishing attacks through realistic simulated email scenarios and instant
feedback. Built with React as part of the Frontend Systems module.

## Setup

Install dependencies:

```bash
cd phishtrainer
npm install
```

The app needs two processes running at the same time: the mock API and the
dev server.

Start the mock API (JSON Server) in one terminal:

```bash
npm run api
```

Start the dev server in a second terminal:

```bash
npm run dev
```

Then open http://localhost:5173 in your browser. The API runs on
http://localhost:3001.

## Scripts

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Start the Vite dev server                    |
| `npm run api`   | Start JSON Server on port 3001 (`db.json`)   |
| `npm run build` | Create a production build                    |
| `npm run lint`  | Run ESLint                                    |

## Tech Stack

- React
- Vite
- React Router
- JSON Server (mock REST backend)

## Project Structure

```
phishtrainer/
  db.json            mock backend data served by JSON Server
  src/
    components/      reusable UI components
    views/           main screens (Dashboard, Scenario, Feedback, History)
    hooks/           custom hooks (useApiData)
    services/        API access layer (fetch wrappers)
    App.jsx          routing setup
    main.jsx
    index.css        global styles
```

## Data Flow

All screens load their data from the mock API through the `useApiData` hook,
which wraps the fetch helpers in `services/api.js`. Scenario decisions and
selected red flags are passed to the Feedback screen via URL query
parameters, so the result is computed from the user's actual choices.
