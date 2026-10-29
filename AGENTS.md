# FitFaat - AI Development Instructions

## Project

FitFaat is a three-person MERN fitness and nutrition project.

Use:

- React, Vite, and JavaScript for the frontend.
- Tailwind CSS, shadcn/ui, and Motion for React for styling and UI.
- Node.js and Express for the backend.
- MongoDB and Mongoose for persistence.
- Render (frontend and backend) and MongoDB Atlas for deployment.
- npm for package management.

Keep the implementation straightforward and understandable
for a student team.

## Read Before Working

1. Read `README.md` for the project overview and current setup.
2. Read the relevant sections of `docs/requirements/requirements.md`.
3. Inspect existing code and package configuration.
4. Read `DESIGN.md` when working on the interface.

`DESIGN.md` defines the visual design language: colours, typography,
components, and screen rules, with links to the Figma kit.

The requirements document defines the feature list.
This file defines development behaviour.

If the task conflicts with those requirements, explain the
conflict before implementing a different behaviour.

## Task Scope

- Work on the assigned feature or task.
- Briefly describe the approach before editing.
- Make routine implementation decisions within the agreed scope.
- Ask when a missing decision changes scope, a shared interface,
  or another member's work.
- Avoid unrelated refactoring.
- Do not add new frameworks, paid services, or major dependencies
  without team agreement.
- Do not introduce TypeScript, microservices, automation workflows,
  or additional instruction files unless requested.

## Repository Structure

- `client/src/features/`: Feature-specific frontend code.
- `client/src/components/`: Reusable interface components.
- `client/src/services/`: API access.
- `client/src/styles/`: Shared styles.
- `server/src/modules/`: Feature-specific backend code.
- `server/src/middleware/`: Shared request middleware.
- `server/src/config/`: Application configuration.
- `docs/requirements/requirements.md`: Feature requirements.

Follow existing patterns. Do not reorganize the repository
without a clear task requirement.

## Implementation Rules

- Reuse existing components and utilities before adding new ones.
- Keep React components focused.
- Keep business calculations separate from UI rendering.
- Keep route handlers small and business logic testable.
- Validate incoming data on the server.
- Use consistent API responses and error handling.
- Coordinate shared API and data-model changes with affected owners.
- Use the units and historical-record rules defined in the requirements.
- Never present mock records as a user's actual saved data.

## Accounts and Uploads

- Require authentication for private records.
- Check ownership for every read, update, delete, and photo request.
- Derive ownership from the authenticated user.
- Never return password hashes or expose secrets in logs.
- Never commit credentials, environment files, or user uploads.
- Never expose secrets through frontend environment variables.
- Do not implement personal profile, body, or progress-photo uploads.
- Food photos are optional attachments to food-diary entries.
- Follow the requirements' file type, size, privacy, and deletion requirements.
- Validate actual image content; do not trust the filename alone.
- Infer calories or nutrition from a photo only as the requirements' food-photo rules allow, and never save an estimate without user confirmation.

## Interface Rules

- Reuse shared controls and existing styles.
- Keep pages usable on desktop and mobile.
- Use labelled inputs, keyboard-accessible controls, and visible focus.
- Handle loading, empty, error, and success states where relevant.
- Respect reduced-motion preferences when adding animation.
- Follow the colours, typography, and components in `DESIGN.md`.
- Do not install or invoke external design skills unless requested
  for the task.

## Verification

- Inspect package scripts before running commands.
- Do not claim development or test commands exist unless configured.
- Verify the feature's acceptance criteria.
- Add meaningful tests for calculations, validation, and ownership.
- Include failure cases, not only successful requests.
- Never weaken tests just to obtain a passing result.
- Run the relevant available checks.
- If a check cannot run, report the reason and what remains unverified.

## Git and Team Work

- Use a task branch based on the latest agreed `main`.
- Keep changes focused and reviewable.
- Preserve other developers' work.
- Coordinate changes to shared configuration and dependencies.
- Do not push directly to `main`, force-push shared branches,
  or merge pull requests unless explicitly instructed.

## Documentation

- Update the README when setup or commands change.
- Update the requirements when the team explicitly changes requirements.
- Keep these three documents consistent.
- Do not mark planned features as implemented without verification.
- Update `DESIGN.md` when the Figma kit or design rules change.

## Completion Report

At the end of a task, report:

1. What behaviour was implemented.
2. Which files changed.
3. Which checks ran and their results.
4. Any limitations, blockers, or unverified behaviour.
