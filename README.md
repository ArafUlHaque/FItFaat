# FitFaat

FitFaat is a fitness and nutrition web application developed by a
three-member team for a System Design course.

It helps users record workouts, track food intake, create workout
and meal plans, and review their progress.

## Project Status

The Express server is set up with a shared MongoDB Atlas connection,
sign-up and sign-in, and a health check. The React client is not
set up yet.

Features listed below are planned, not completed.

## Technology Stack

- Frontend: React, Vite, JavaScript
- Styling: Tailwind CSS, with the team's own components from
  `DESIGN.md`
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- Deployment: Render (frontend and backend), MongoDB Atlas (database)
- Package manager: npm
- Version control: Git and GitHub
- Project management: Jira with Scrum
- AI development tools: Codex and Claude Code

## Planned Features

| Module | Member 1 | Member 2 | Member 3 |
| --- | --- | --- | --- |
| 1 | Exercise library with favourites (wger API) | AI meal photo nutrition estimate (Gemini API) | Measurements, goals, and progress |
| 2 | Workout sessions | Recipe nutrition calculator | Activity tracking |
| 3 | Workout programme generator | Meal scheduling and shopping list | Weekly review and suggestions |
| 3 | Workout programme adjustment | Habit tracking | Premium packages (SSLCOMMERZ sandbox) |

Sign-up, sign-in, profiles, the food diary, and the dashboard
support these features but are not counted as features.

See [requirements](docs/requirements/requirements.md) for the detailed
feature list.

## Main Directories

- `client/`: React frontend (not created yet)
- `server/`: Express backend
- `docs/requirements/`: Feature requirements
- `docs/api/`: API documentation and Postman collection

## Project Documents

- `README.md`: Project overview and setup
- `docs/requirements/requirements.md`: Feature list
- `AGENTS.md`: Shared development instructions for AI tools
- `DESIGN.md`: Visual design language and Figma links

## Development Setup

Requires Node.js 20 or later.

### Backend

1. Install dependencies from the repository root:

   ```bash
   npm install
   ```

2. Copy `server/.env.example` to `server/.env` and fill it in:
   - `MONGODB_URI`: your own database user for the shared Atlas
     cluster (ask Araf). Everyone uses the same `fitfaat_dev` database.
   - `PORT`: the last four digits of your student ID.
   - `JWT_SECRET`: a long random string.

3. Start the server with automatic restarts:

   ```bash
   npm run dev:server
   ```

   `GET http://localhost:<PORT>/api/v1/health` should report
   `"database": "connected"`.

   If startup fails with `querySrv ECONNREFUSED`, Node can't look up
   the Atlas address through your DNS settings. Add
   `DNS_SERVERS=8.8.8.8,1.1.1.1` to `server/.env`.

4. Run the tests:

   ```bash
   npm run test:server
   ```

### Shared database rules

- All members use one Atlas cluster and the `fitfaat_dev` database.
- Change only your own feature's collections. The `users` collection
  is shared; agree changes with the team first.
- Never drop collections or delete all documents in `fitfaat_dev`.
- Add reference data, such as templates or food lists, through a seed
  script in your module, not by hand.

### Backend conventions

- Feature code goes in `server/src/modules/<feature>/`, with its
  routes mounted in `server/src/app.js` under `/api/v1/`.
- Protect private routes with `requireAuth`, then use `req.userId`
  as the owner of every record. Never trust a user ID from the
  request body.
- Successful responses use `{ "success": true, "data": ... }`.
- Throw `new ApiError(status, message, details)` for errors; the
  error handler sends `{ "success": false, "error": { "message",
  "details" } }`.

Auth endpoints:

| Method | Endpoint | Body | Auth |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | `name`, `email`, `password` | None |
| POST | `/api/v1/auth/login` | `email`, `password` | None |
| GET | `/api/v1/auth/me` | None | `Authorization: Bearer <token>` |

Register and login return `{ user, token }`. Sign out by discarding
the token on the client.

Never commit real credentials, local environment files, or uploaded
user images.

## Team Workflow

Each member owns complete features, including their frontend,
backend, database logic, and relevant tests.

For each task:

1. Agree on the task and its acceptance criteria in Jira.
2. Create a short-lived branch from the latest `main`.
3. Implement and verify the change.
4. Open a pull request linked to the Jira task.
5. Have another teammate review it before merging.

Example branch: `feat/FIT-12-workout-logging`

Use the actual Jira project key once it has been created.

## AI-Assisted Development

Start AI sessions from the repository root.

Tell the AI to read `AGENTS.md` and the relevant sections of
`docs/requirements/requirements.md` before making changes.

Each developer remains responsible for understanding, testing,
and explaining the code they submit.
