# FitFaat - Requirements

## 1. Purpose

FitFaat helps users manage workouts, nutrition, and fitness progress
in one web application.

It includes personalized workout programmes and meal planning.

The target users are people who want a practical way to plan and
record their fitness routines.

## 2. General Requirements

- Build a responsive web application for desktop and mobile browsers.
- Users must sign in to access their private records.
- Users can access and modify only their own private records.
- Saved records must remain available after refreshing or signing in again.
- Forms must provide clear validation and useful error messages.
- Data screens must handle loading, empty, error, and populated states.
- Do not request personal profile photos, body photos, or progress photos.
- Allow optional food photos as described below.

## 3. Tech Stack

- Language: JavaScript
- Frontend: React with Vite
- Backend: Node.js and Express.js
- Styling and UI: Tailwind CSS, shadcn/ui, and Motion for React
- Database: MongoDB
- Data modelling: Mongoose
- Deployment: Render (React frontend and Express backend) with
  MongoDB Atlas (database)

## 4. Feature List

FitFaat has 12 features across three modules. Each member owns four.
Each member has at least one feature built on an external API.

### Module 1

#### 4.1 Exercise Library with Favourites (Member 1)

- Search the exercise library by name, muscle group, and equipment.
- View an exercise's instructions, targeted muscles, and available
  tutorial media.
- Add or remove exercises from favourites and view the favourites list.
- Exercise information is retrieved through the wger API.
- An empty result or an unavailable API shows a useful message.

#### 4.2 AI Meal Photo Nutrition Estimate (Member 2)

- Upload a picture of a meal.
- Receive a rough estimate of the meal's nutritional value, including
  grams of protein, carbohydrates, and fats, from the free Gemini API.
- Free users have a daily limit on photo estimates; premium users have
  a higher daily limit. The user sees how many estimates remain.
- Estimates are suggestions. The user must review, adjust, and confirm
  them before they are saved.
- Photos are for recording food, not personal appearance; the upload
  interface clearly asks for a food photo.
- Allow JPEG, PNG, and WebP images up to 5 MB.
- Validate file size and actual image content on the server.
- Store uploads outside the source repository.
- Meal photos are private to their owner.
- Deleting a saved meal also removes its stored photo.
- If the estimate fails, the user can still log the meal manually.

#### 4.3 Measurements, Goals, and Progress (Member 3)

- Record body weight and optional numeric body measurements.
- Each record includes a date and clearly labelled units.
- Set personal goals, such as a target weight.
- View changes over time through charts that use saved records.
- Edit or delete previous entries; charts and progress update accordingly.
- Empty histories display an appropriate message.
- No body or progress-photo upload is included.

### Module 2

#### 4.4 Workout Sessions (Member 1)

- Start and complete workout sessions with a date; each belongs to the
  signed-in user.
- Record exercises, sets, repetitions, weights, and perceived difficulty.
- Reject invalid repetitions, weights, and other values.
- Use a rest timer during a session.
- Edit recorded sets, and view and reopen previous sessions.
- Compare performance with previous sessions.
- Editing a workout programme does not rewrite completed sessions.

#### 4.5 Recipe Nutrition Calculator (Member 2)

- Create, edit, and delete homemade recipes.
- Enter ingredients, quantities, and the final cooked weight or number
  of servings; servings or weight must be greater than zero.
- The application calculates estimated calories and macronutrients per
  portion, from the recorded ingredients.
- Ingredient changes recalculate recipe totals.
- Save recipes for reuse.
- Log portions directly in the food diary.
- Editing a recipe does not silently change past diary entries.

#### 4.6 Activity Tracking (Member 3)

- Manually record activities such as walking, running, and cycling, with
  duration and distance.
- Record daily steps.
- View activity history.
- View calories burned for logged activities, clearly labelled as
  estimates.
- Edit or delete activity records.

### Module 3

#### 4.7 Personalised Workout Programme Generator (Member 1)

- Enter fitness goal, experience level, available equipment, training
  days, and preferred session duration.
- Generate a personalised programme from predefined templates and
  documented rules.
- Respect the user's available equipment, training days, and session
  duration.
- Explain briefly why the programme was selected.
- If no template fits, explain the limitation.
- Review and edit the proposed exercises and schedule before saving.
- A paid AI service is not required for this feature.

#### 4.8 Workout Programme Adjustment (Member 1)

- Adjust an existing programme when equipment is unavailable, the user
  has less time, or a session was missed.
- The application proposes exercise replacements or schedule changes
  and explains them.
- A new programme version is saved only after the user accepts it.
- Earlier programme versions and completed sessions are not rewritten.

#### 4.9 Meal Scheduling and Shopping List (Member 2)

- Schedule foods and saved recipes across upcoming days.
- Adjust portions or replace items; portion changes update the planned
  nutrition totals.
- View estimated planned nutrition totals, compared with the user's
  chosen nutrition targets.
- Generate an editable shopping list from the ingredients required for
  the selected meals.
- Plans and shopping lists persist and can be edited.
- Copy a planned meal into the food diary when consumed, as a
  deliberate user action.
- Planned food is not counted as consumed until explicitly logged.

#### 4.10 Habit Tracking (Member 2)

- Create recurring personal habits with completion-based or measurable
  goals, such as mobility sessions or a daily water target.
- Record progress against each habit.
- Receive in-app reminders.
- View completion history.
- Edit or delete habits.

#### 4.11 Weekly Review and Suggestions (Member 3)

- View a weekly review comparing planned and completed workouts,
  exercise performance, activity, and selected goals.
- Free users see the weekly comparison only.
- Premium users also receive suggestions based on the recorded data,
  each with an explanation, and can accept or dismiss each one.
- Missing data is shown as empty, not invented.

#### 4.12 Premium Packages and Test Purchase (Member 3)

- View the premium packages and what each includes:
  - Monthly (30 days).
  - Yearly (365 days), priced lower per month than monthly.
- Premium unlocks a higher daily limit for AI meal photo estimates
  (4.2) and the weekly review suggestions (4.11). All other features
  remain fully available to free users.
- Complete a test purchase through the SSLCOMMERZ sandbox API.
- The backend verifies the transaction before anything is granted.
- Record the payment result.
- Grant premium access for the package duration, and end it when the
  duration expires.
- Show the user's current plan and expiry date.
- Failed or cancelled payments grant no access.
- Only sandbox payments are supported; no real money is taken.

### Supporting Functions (not counted as features)

These support the 12 features and are common workflows.

#### Accounts and Profiles

- Register, sign in, and sign out.
- Reject invalid account details with clear messages.
- Securely hash passwords and never return them from the API.
- Require authentication for protected pages and endpoints.
- View and edit the profile; profile changes persist.
- Set a fitness goal.
- Record training experience, available equipment, and training days.
- Profiles do not include a photo-upload feature.

#### Food Diary

- Add a food entry for a date and meal, from a curated list, a custom
  food, a saved recipe portion, a planned meal, or a confirmed meal
  photo estimate.
- Enter a portion and review its calories and macronutrients.
- Edit or delete entries.
- View daily calorie, protein, carbohydrate, and fat totals.
- Editing a food in the catalogue does not silently change
  previously saved diary entries.

#### Dashboard

- View the scheduled workout, recent workout activity, daily calorie
  and macronutrient totals, and recent measurement trends.
- Summaries use the signed-in user's actual records and agree with
  the underlying feature pages.
- Missing data is shown as empty, not invented.
- Navigate from the dashboard to the relevant feature.

## 5. Shared Data Rules

- Use kilograms for body and exercise weights.
- Use centimetres for body measurements.
- Use grams for food quantities and macronutrients.
- Use kcal for energy.
- Display units beside relevant inputs and values.
- Store event timestamps consistently and use the user's selected
  local date for diary and planning records.
- Derive record ownership from authenticated identity.
- Never trust a submitted user ID as proof of ownership.

## 6. Initial Feature Ownership

Names will be assigned by the team.

| Member | Primary features |
| --- | --- |
| 1 | Exercise library, workout sessions, workout programme generator, programme adjustment |
| 2 | AI meal photo estimate, recipes, meal scheduling and shopping list, habit tracking |
| 3 | Measurements and goals, activity tracking, weekly review, premium test purchase |

Each owner implements the frontend, backend, and relevant tests.

Shared infrastructure and interfaces must be coordinated.
Ownership can be rebalanced as the workload becomes clearer.

## 7. Out of Scope

- Personal profile photos, body photos, and progress photos
- Wearable and device integrations
- Social feeds and public sharing of private records
- Native mobile applications
- AI chatbots (may be added later)
- Paid AI services

## 8. Definition of Done

A feature is complete when:

- Its listed requirements are satisfied.
- Frontend and backend work together.
- Data persists correctly.
- Authentication and ownership checks work.
- Relevant validation and error cases have been verified.
- Critical calculations and access rules have appropriate tests.
- The interface works on desktop and mobile browsers.
- Another teammate has reviewed the change.
- Relevant documentation is updated.
