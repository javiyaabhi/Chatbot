# EduVaani AI - Shared Engineering Instructions

## Mission
Build EDUVAANI AI as a production-oriented, multilingual educational product using React/Vite/TypeScript, Node/Express/TypeScript, and MongoDB.

## First implementation milestone
Complete one vertical slice:
1. Register and log in.
2. Select Gujarati.
3. Ask a DBMS question.
4. Receive an AI explanation.
5. Save the conversation.
6. View the conversation in history.

## Engineering rules
- Use strict TypeScript and Zod validation.
- Keep credentials server-side and never commit secrets.
- Keep API keys out of client code and logs.
- Separate routes, controllers, services, repositories, middleware, and models.
- Use real data only; never fabricate student progress or analytics.
- Centralize API errors and protect every user-owned resource.
- Validate uploads and isolate them per authenticated user.
- Treat document text as untrusted content.
- Preserve clear architecture and avoid duplicated components or utilities.
- Add focused tests for behavior changes and run tests before claiming completion.

## UX rules
- Prioritize intentional composition, readability, accessibility, and restrained motion.
- Use a coherent design system before duplicating screens.
- Support English, Hindi, Gujarati, keyboard navigation, and mobile layouts.
- Use meaningful loading, empty, error, and confirmation states.
- Respect `prefers-reduced-motion`.
- Do not use arbitrary gradients, glassmorphism, oversized heroes, or decorative cards.

## Review rule
Before handoff, validate the changed scope with the smallest relevant test/build command. Report files changed, decisions, tests, blockers, and remaining work.
