# Experiment Prototype

An interactive prototype for studying how explanation styles affect reactions to fair but unfavorable multi-agent decisions.

## Run locally

```bash
npm install
npm run dev
```

## Prototype flow

- **Researcher view** selects random assignment or a specific explanation condition, starts participant sessions, and reviews recorded responses.
- **Participant view** collects a short profile, presents the resource-allocation scenario, shows one explanation condition, and records ratings.

Responses are stored only in the active browser session.

## Deploy to Vercel

Import this repository in Vercel. It is a standard Vite project: Vercel should use `npm run build` and publish the `dist` folder.
