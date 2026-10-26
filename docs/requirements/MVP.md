# FitFaat - First-Release Requirements

## 1. Purpose

FitFaat helps users manage workouts, nutrition, and fitness progress
in one web application.

The first release is an expanded MVP: a usable initial version
with personalized workout plans and meal planning.

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

## 3. Features

### 3.1 Accounts and Profiles

Users can:

- Register, sign in, and sign out.
- View and edit their profile.
- Set a fitness goal.
- Record training experience, available equipment, and training days.

Acceptance criteria:

- Invalid account details are rejected with clear messages.
- Passwords are securely hashed and never returned by the API.
- Protected pages and endpoints require authentication.
- Profile changes persist.
- Profiles do not include a photo-upload feature.

### 3.2 Exercise Library

Users can:

- Browse a curated collection of exercises.
- Search by exercise name.
- Filter by muscle group and equipment.
- View exercise instructions.

Acceptance criteria:

- Search and filters return matching exercises.
- Each exercise includes its name, muscle group, equipment,
  and instructions.
- An empty result provides a useful message.

### 3.3 Workout Logging

Users can:

- Create a workout session.
- Add exercises and record sets, repetitions, and weights.
- Edit or delete their workout records.
- View previous sessions.

Acceptance criteria:

- Workout records include a date and belong to the signed-in user.
- Invalid repetitions, weights, and other values are rejected.
- Saved sessions can be reopened and edited.
- Editing a workout plan does not rewrite completed sessions.

### 3.4 Personalized Workout Plans

Users can:

- Generate a plan using their goal, experience, equipment,
  and available training days.
- View scheduled exercises, sets, and repetitions.
- Edit and save their plan.

Acceptance criteria:

- Use predefined templates and documented rules.
- Plans respect the user's available equipment and training days.
- Explain briefly why the plan was selected.
- If no template fits, explain the limitation.
- A paid AI service is not required for this feature.

### 3.5 Food Diary and Food Photos

Users can:

- Add a food entry for a date and meal.
- Select a food from a curated list or enter a custom food.
- Enter a portion and review its calories and macronutrients.
- Attach, replace, or remove one optional food photo per entry.
- Use automatic food recognition or calorie estimation from images.
- Edit or delete their entries.
- View daily calorie, protein, carbohydrate, and fat totals.

Acceptance criteria:

- Food logging works without a photo.
- Photos are for recording food, not personal appearance.
- The upload interface clearly asks for a food photo.
- Allow JPEG, PNG, and WebP images up to 5 MB.
- Validate file size and actual image content on the server.
- Store uploads outside the source repository.
- Food photos are private to the entry's owner.
- Deleting an entry also removes its attached stored photo.
- Nutrition totals use the recorded food values and portion.
- Calorie or nutrition estimates from a photo are suggestions that the user must review and confirm before they are saved.
- Editing a food in the catalogue does not silently change
  previously saved diary entries.

### 3.6 Recipe Nutrition Calculator

Users can:

- Create a recipe from ingredients and quantities.
- Set the number of servings.
- View total and per-serving nutrition.
- Save, edit, and delete their recipes.
- Add a serving of a recipe to their food diary.

Acceptance criteria:

- Nutrition is calculated from the recorded ingredients.
- Servings must be greater than zero.
- Ingredient changes recalculate recipe totals.
- Editing a recipe does not silently change past diary entries.

### 3.7 Meal Planning

Users can:

- Plan meals for a day or week.
- Add foods and recipes to planned meals.
- Adjust portions or replace items.
- Compare planned totals with their chosen nutrition targets.
- Copy a planned meal into their food diary when consumed.

Acceptance criteria:

- Plans persist and can be edited.
- Portion changes update planned nutrition totals.
- Planned food is not counted as consumed until explicitly logged.
- Copying a meal requires a deliberate user action.
- Automatic AI meal generation is not required.

### 3.8 Measurements and Progress

Users can:

- Record body weight and optional numeric body measurements.
- View dated measurement history.
- Edit or delete measurement records.
- Review progress through charts.

Acceptance criteria:

- Each record includes a date and clearly labelled units.
- Charts use saved records.
- Empty histories display an appropriate message.
- No body or progress-photo upload is included.

### 3.9 Dashboard

Users can view:

- Their scheduled workout.
- Recent workout activity.
- Daily calorie and macronutrient totals.
- Recent measurement trends.

Acceptance criteria:

- Summaries use the signed-in user's actual records.
- Missing data is shown as empty, not invented.
- Dashboard calculations agree with the underlying feature pages.
- Users can navigate to the relevant feature from the dashboard.

## 4. Shared Data Rules

- Use kilograms for body and exercise weights.
- Use centimetres for body measurements.
- Use grams for food quantities and macronutrients.
- Use kcal for energy.
- Display units beside relevant inputs and values.
- Store event timestamps consistently and use the user's selected
  local date for diary and planning records.
- Derive record ownership from authenticated identity.
- Never trust a submitted user ID as proof of ownership.

## 5. Initial Feature Ownership

Names will be assigned by the team.

| Member | Primary features |
| --- | --- |
| A | Accounts, profiles, measurements, dashboard integration |
| B | Exercise library, workout logging, personalized workout plans |
| C | Food diary, food photos, recipes, meal planning |

Each owner implements the frontend, backend, and relevant tests.

Shared infrastructure and interfaces must be coordinated.
Ownership can be rebalanced as the workload becomes clearer.

## 6. Outside the First Release

- Personal profile photos, body photos, and progress photos
- Wearable and device integrations
- Social feeds and public sharing of private records
- Payments and subscription billing
- Native mobile applications
- AI chatbots and paid AI-generated recommendations

## 7. Definition of Done

A feature is complete when:

- Its acceptance criteria are satisfied.
- Frontend and backend work together.
- Data persists correctly.
- Authentication and ownership checks work.
- Relevant validation and error cases have been verified.
- Critical calculations and access rules have appropriate tests.
- The interface works on desktop and mobile browsers.
- Another teammate has reviewed the change.
- Relevant documentation is updated.
