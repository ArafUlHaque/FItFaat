// Allowed quiz answers. Keys are what the API accepts; values are the
// human-readable labels used in explanations.

export const GOALS = {
  build_muscle: "build muscle",
  get_stronger: "get stronger",
  lose_fat: "lose fat",
  general_fitness: "improve your general fitness",
};

export const LEVELS = {
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
};

// Bodyweight is always available, so it is not in this list.
export const EQUIPMENT = {
  barbell: "barbell",
  dumbbells: "dumbbells",
  bench: "bench",
  pullup_bar: "pull-up bar",
  cable_machine: "cable machine",
  kettlebell: "kettlebell",
  resistance_band: "resistance band",
};

export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const MIN_SESSION_MINUTES = 15;
export const MAX_SESSION_MINUTES = 180;
