# FitFaat

FitFaat is a fitness and nutrition web application developed by a
three-member team for a System Design course.

It helps users record workouts, track food intake, create workout
and meal plans, and review their progress.

## Project Status

The repository currently contains the initial directory structure.
The application, installation steps, and development commands are
not configured yet.

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

Setup instructions will be added when the frontend and backend
are initialized.

The repository includes `.env.example` as a configuration reference.
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

Automation, advanced repository configuration, and additional
documentation will be introduced later when needed.
