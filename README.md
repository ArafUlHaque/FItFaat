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
- Styling and UI: Tailwind CSS, shadcn/ui, Motion for React
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- Deployment: Render (frontend and backend), MongoDB Atlas (database)
- Package manager: npm
- Version control: Git and GitHub
- Project management: Jira with Scrum
- AI development tools: Codex and Claude Code

## Planned Features

- User accounts, profiles, and fitness goals
- Exercise library
- Workout logging and history
- Personalized workout plans
- Food diary with optional food photos
- Calorie and macronutrient tracking
- Recipe nutrition calculator
- Meal planning
- Body measurements and progress charts
- Fitness and nutrition dashboard

FitFaat will not request personal profile photos, body photos,
or progress photos. Photo uploads are intended only for food.

See [requirements](docs/requirements/requirements.md) for the detailed
feature list.

## Main Directories

- `client/`: React frontend
- `server/`: Express backend
- `docs/requirements/`: Feature requirements

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

5. Reference data: the programme templates live in
   `server/src/modules/programmes/templates.data.js`. After changing
   that file, copy it into the database (safe to run more than once):

   ```bash
   npm run seed:templates
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

Exercise library and favourites (4.1). Exercise data comes from the
public [wger API](https://wger.de/api/v2/); if wger is unreachable the
API returns `503` with an explanation.

| Method | Endpoint | Body / query | Auth |
| --- | --- | --- | --- |
| GET | `/api/v1/exercises` | `search`, `muscle`, `equipment` (wger ids), `page`, `limit` | None |
| GET | `/api/v1/exercises/filters` | None | None |
| GET | `/api/v1/exercises/:id` | None | None |
| GET | `/api/v1/favourites` | None | Bearer token |
| POST | `/api/v1/favourites` | `exerciseId` | Bearer token |
| DELETE | `/api/v1/favourites/:exerciseId` | None | Bearer token |

Programme generator (4.7). The matching rules are documented at the
top of `server/src/modules/programmes/programme.rules.js`.

| Method | Endpoint | Body | Auth |
| --- | --- | --- | --- |
| GET | `/api/v1/programmes/templates` | None | None |
| POST | `/api/v1/programmes/generate` | `goal`, `experience`, `equipment`, `daysPerWeek`, `sessionMinutes` | None |
| POST | `/api/v1/programmes` | `templateKey`, `name?`, `answers`, `schedule` | Bearer token |
| GET | `/api/v1/programmes` | None | Bearer token |
| GET | `/api/v1/programmes/:id` | None | Bearer token |
| PATCH | `/api/v1/programmes/:id` | `name` | Bearer token |
| DELETE | `/api/v1/programmes/:id` | None | Bearer token |

Never commit real credentials, local environment files, or uploaded
user images.

Recipe nutrition calculator (4.5). Portions logged to the food diary store a frozen nutrition snapshot so later recipe edits do not alter past diary entries.

| Method | Endpoint | Body / query | Auth |
| --- | --- | --- | --- |
| GET | `/api/v1/recipes` | None | Bearer token |
| POST | `/api/v1/recipes` | `name`, `notes?`, `splitMode`, `servings?`, `cookedWeightGrams?`, `ingredients` | Bearer token |
| GET | `/api/v1/recipes/:id` | None | Bearer token |
| PUT | `/api/v1/recipes/:id` | `name`, `notes?`, `splitMode`, `servings?`, `cookedWeightGrams?`, `ingredients` | Bearer token |
| DELETE | `/api/v1/recipes/:id` | None | Bearer token |
| POST | `/api/v1/recipes/:id/log` | `date?`, `mealType?`, `amount?` | Bearer token |

Habit tracking (4.10). Supports completion-based and measurable daily goals, 28-day history grids, and in-app reminders.

| Method | Endpoint | Body / query | Auth |
| --- | --- | --- | --- |
| GET | `/api/v1/habits` | `date?` (`YYYY-MM-DD`) | Bearer token |
| GET | `/api/v1/habits/reminders` | `date?`, `time?` (`HH:MM`) | Bearer token |
| POST | `/api/v1/habits` | `name`, `goalType`, `targetValue?`, `unit?`, `repeatDays?`, `reminderEnabled?`, `reminderTime?` | Bearer token |
| GET | `/api/v1/habits/:id` | `date?`, `days?` (1–90, default 28) | Bearer token |
| PATCH | `/api/v1/habits/:id` | `name`, `goalType`, `targetValue?`, `unit?`, `repeatDays?`, `reminderEnabled?`, `reminderTime?` | Bearer token |
| DELETE | `/api/v1/habits/:id` | None | Bearer token |
| POST | `/api/v1/habits/:id/progress` | `date?`, `value?` or `delta?` | Bearer token |
| POST | `/api/v1/habits/:id/dismiss-reminder` | `date?` | Bearer token |

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

Automation, advanced repository configuration, and additional
documentation will be introduced later when needed.
