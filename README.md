# iTHINKwip

iTHINK is a human-led self-observation and cognitive practice lab. Its current
prototype brings together brief cognitive exercises, focused-work tools,
neuroscience learning resources, and personal progress tracking.

**Product promise:** iTHINK helps people notice patterns in how they focus and
think through brief reflection, optional AI-supported questions, and small
self-chosen experiments.

The product is being developed around a simple, user-led practice loop:

**Notice → Reflect → Choose**

iTHINK's reflection practice is a contemporary adaptation inspired by
self-inquiry traditions; it does not claim a single, continuous ancient method.
The Flow State Lab is the first product module. Its short core path asks what
the person was doing, what they noticed, and what they might try next. Context,
self-ratings, and AI support are optional. People can review and copy a
reflection prompt into an AI service and bring back a response to assess for
themselves. The prototype does not send reflection data to an AI.

iTHINK is an exploratory self-reflection tool, not a clinical assessment. It
does not measure or increase consciousness, detect flow or brain activity, or
diagnose a mental-health condition.

## Run locally

**Prerequisite:** Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Vite serves the app at `http://localhost:3000`. The current client-side
prototype does not require a Gemini API key.

## Project scripts

- `npm run dev` starts the local development server.
- `npm run build` creates the production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs the TypeScript check.

## Project structure

- `src/App.tsx`: app shell, navigation state, and locally stored session data.
- `src/components/`: practice modules and supporting product areas.
- `src/data/`: educational content and static product data.
- `src/utils/`: audio and task utilities.
- `src/types/`: shared TypeScript types.

The app keeps session data in the browser's local storage. Do not enter
sensitive or identifying information into this prototype. Reflection entries
are stored in the current browser profile and are not synced or encrypted by
this prototype. Data only leaves the app when the user copies it to another
service.
