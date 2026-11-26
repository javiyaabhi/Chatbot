# EduVaani AI

EduVaani AI is a multilingual academic tutor for students. Ask questions in English, Hindi, or Gujarati and get explanations tailored to a selected teaching level. The responsive tutor workspace includes subject starters, conversation history, Markdown answers, code examples, and speech playback.

## Features

- English, Hindi, and Gujarati learning experiences
- Guest sessions and conversation management
- Teaching modes from beginner explanations to exam preparation
- Subject starters for Database Systems, Operating Systems, Computer Networks, and Data Structures & Algorithms
- Gemini-powered answers when `GEMINI_API_KEY` is configured
- Responsive React client and Express API

## Tech stack

- Client: React, TypeScript, Vite, Tailwind CSS
- Server: Node.js, Express, TypeScript
- Validation: Zod
- AI: Google Gemini API
- Database connection: MongoDB via Mongoose

## Run locally

Requirements: Node.js 20.19+, 22.12+, or 23.5+ and npm.

```sh
npm install
npm run install:all
```

Create `server/.env` from `server/.env.example` and set the values for your environment. At minimum, set a unique `JWT_SECRET` and a valid `GEMINI_API_KEY` to enable live AI answers. The server can run without `MONGODB_URI`, using in-memory storage instead.

PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

macOS/Linux:

```sh
cp server/.env.example server/.env
```

Start the client and API together:

```sh
npm run dev
```

The client runs at <http://127.0.0.1:5173> and the API at <http://localhost:4000>. The client proxies `/api` requests to the API.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (defaults to `4000`) |
| `JWT_SECRET` | Secret used to sign session cookies; use a strong, unique value |
| `GEMINI_API_KEY` | Google AI Studio API key; required for live Gemini responses |
| `GEMINI_MODEL` | Gemini model name (defaults to `gemini-3.5-flash`) |
| `MONGODB_URI` | MongoDB connection string; optional for local startup |
| `CLIENT_ORIGIN` | Allowed client origin for credentialed API requests |
| `NODE_ENV` | Set to `production` for production cookie settings |

Keep secrets in local environment files or your hosting provider's environment settings. Do not commit them.

## Build and tests

```sh
npm run build
npm run test --prefix server
```

The client end-to-end tests use Playwright. Start the app with `npm run dev`, then run:

```sh
npm run test:e2e --prefix client
```

## Deploy to Render

The repository includes a Render Blueprint in [`render.yaml`](./render.yaml). In Render, create a new Blueprint deployment from this repository and provide the requested `GEMINI_API_KEY`. The Blueprint generates `JWT_SECRET` and configures the build and start commands. MongoDB is not required for this deployment.

**Persistence note:** The current user and conversation stores are in memory, so data can be lost when the service restarts or redeploys. MongoDB persistence is not implemented yet.

The API health endpoint is `/api/health`.
