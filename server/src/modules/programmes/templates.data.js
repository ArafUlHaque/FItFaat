// The predefined programme templates (requirement 4.7).
// This file is the source; `npm run seed:templates` copies it into the
// "programmetemplates" MongoDB collection, and the API reads them from there.

// Each movement pattern has exercise options in order of preference.
// The generator gives the user the first option they have equipment for;
// the remaining usable options are offered as swaps.
// exerciseId values are real wger exercise ids. equipment [] means bodyweight.
const option = (exerciseId, name, ...equipment) => ({ exerciseId, name, equipment });

export const EXERCISE_OPTIONS = {
  squat: [
    option(615, "Squats", "barbell"),
    option(203, "Dumbbell Goblet Squat", "dumbbells"),
    option(1361, "Double Kettlebell Front Squat", "kettlebell"),
    option(1208, "Prisoner Squat"),
  ],
  hinge: [
    option(507, "Romanian Deadlift", "barbell"),
    option(1652, "Dumbbell Romanian Deadlift", "dumbbells"),
    option(960, "Kettlebell Swing", "kettlebell"),
    option(1906, "Hip Bridge"),
  ],
  deadlift: [
    option(184, "Deadlifts", "barbell"),
    option(1370, "Dumbbell Deadlift", "dumbbells"),
    option(1003, "Kettlebell Deadlifts", "kettlebell"),
  ],
  lunge: [
    option(1651, "Dumbbell Rear Lunge", "dumbbells"),
    option(1830, "Barbell Step Back Lunge", "barbell"),
    option(999, "Reverse Lunges"),
  ],
  horizontal_push: [
    option(73, "Bench Press", "barbell", "bench"),
    option(75, "Dumbbell Bench Press", "dumbbells", "bench"),
    option(801, "Dumbbell Push-Up", "dumbbells"),
    option(1551, "Push-Up"),
  ],
  vertical_push: [
    option(566, "Shoulder Press, Barbell", "barbell"),
    option(567, "Shoulder Press, Dumbbells", "dumbbells"),
    option(454, "Pike Push-Ups"),
  ],
  horizontal_pull: [
    option(83, "Bent Over Rowing", "barbell"),
    option(81, "Bent Over Dumbbell Row (Single Arm)", "dumbbells", "bench"),
    option(2669, "Bent Over Dumbbell Rows (Two Arms)", "dumbbells"),
    option(1117, "Seated Cable Row", "cable_machine"),
    option(2635, "Seated Band Row", "resistance_band"),
    option(1198, "Inverted Rows"),
  ],
  vertical_pull: [
    option(475, "Pull-ups", "pullup_bar"),
    option(1510, "Neutral Grip Lat Pulldown", "cable_machine"),
    option(1929, "Assisted Pull-Up", "pullup_bar", "resistance_band"),
    option(161, "Cross-Bench Dumbbell Pullovers", "dumbbells"),
  ],
  biceps: [
    option(1931, "Dumbbell Curl", "dumbbells"),
    option(91, "Biceps Curls With Barbell", "barbell"),
    option(272, "Hammer Curls", "dumbbells"),
    option(974, "Two-Handed Kettlebell Curl", "kettlebell"),
  ],
  triceps: [
    option(1336, "Triceps Overhead (Dumbbell)", "dumbbells"),
    option(1185, "Triceps Pushdown", "cable_machine"),
    option(2684, "Triceps Push-Up"),
  ],
  lateral_raise: [
    option(348, "Lateral Raises", "dumbbells"),
    option(1378, "Cable Lateral Raise (Single Arm)", "cable_machine"),
  ],
  calves: [option(2661, "Dumbbell Calf Raise", "dumbbells"), option(1243, "Double Leg Calf Raise")],
  core: [option(458, "Plank"), option(167, "Crunches"), option(1412, "Bicycle Crunches")],
  conditioning: [
    option(997, "4-Count Burpees"),
    option(996, "Mountain Climbers"),
    option(1314, "Jumping Jacks"),
  ],
};

// One exercise slot in a day: which movement, and how many sets/reps/rest.
const slot = (pattern, sets, reps, restSeconds) => ({
  pattern,
  sets,
  reps,
  restSeconds,
  options: EXERCISE_OPTIONS[pattern],
});

const day = (weekday, title, slots) => ({ weekday, title, slots });

// goals and levels: the first goal is the template's main goal.
export const PROGRAMME_TEMPLATES = [
  {
    key: "full-body-starter",
    name: "Full Body Starter",
    description: "Two short full-body sessions a week to build the habit and learn the main movements.",
    goals: ["general_fitness", "lose_fat"],
    levels: ["beginner"],
    days: [
      day("mon", "Full body A", [
        slot("squat", 3, "10", 60),
        slot("horizontal_push", 3, "10", 60),
        slot("horizontal_pull", 3, "10", 60),
        slot("core", 3, "30s", 45),
      ]),
      day("thu", "Full body B", [
        slot("hinge", 3, "10", 60),
        slot("lunge", 3, "8 each leg", 60),
        slot("vertical_push", 3, "10", 60),
        slot("conditioning", 3, "30s", 45),
      ]),
    ],
  },
  {
    key: "full-body-foundations",
    name: "Full Body Foundations",
    description: "Three full-body sessions a week that train every major muscle with steady progress.",
    goals: ["build_muscle", "get_stronger", "general_fitness"],
    levels: ["beginner", "intermediate"],
    days: [
      day("mon", "Full body A", [
        slot("squat", 3, "8-10", 90),
        slot("horizontal_push", 3, "8-10", 90),
        slot("horizontal_pull", 3, "10", 90),
        slot("hinge", 3, "10", 90),
        slot("core", 3, "30s", 45),
      ]),
      day("wed", "Full body B", [
        slot("deadlift", 3, "6-8", 90),
        slot("vertical_push", 3, "8-10", 90),
        slot("vertical_pull", 3, "8-10", 90),
        slot("lunge", 3, "10 each leg", 90),
        slot("core", 3, "30s", 45),
      ]),
      day("fri", "Full body C", [
        slot("squat", 3, "10-12", 90),
        slot("horizontal_push", 3, "10-12", 90),
        slot("horizontal_pull", 3, "12", 90),
        slot("hinge", 3, "12", 90),
        slot("conditioning", 3, "30s", 45),
      ]),
    ],
  },
  {
    key: "upper-lower-split",
    name: "Upper / Lower Split",
    description: "Four sessions alternating upper and lower body, with heavier main lifts.",
    goals: ["build_muscle", "get_stronger"],
    levels: ["intermediate", "advanced"],
    days: [
      day("mon", "Upper A", [
        slot("horizontal_push", 4, "6-8", 120),
        slot("horizontal_pull", 4, "8", 120),
        slot("vertical_push", 3, "8-10", 90),
        slot("vertical_pull", 3, "8-10", 90),
        slot("biceps", 2, "12", 60),
        slot("triceps", 2, "12", 60),
      ]),
      day("tue", "Lower A", [
        slot("squat", 4, "6-8", 120),
        slot("hinge", 3, "8", 120),
        slot("lunge", 3, "10 each leg", 90),
        slot("calves", 3, "12", 60),
        slot("core", 3, "30s", 45),
      ]),
      day("thu", "Upper B", [
        slot("vertical_push", 4, "6-8", 120),
        slot("vertical_pull", 4, "8", 120),
        slot("horizontal_push", 3, "10", 90),
        slot("horizontal_pull", 3, "10", 90),
        slot("biceps", 2, "12", 60),
        slot("triceps", 2, "12", 60),
      ]),
      day("fri", "Lower B", [
        slot("deadlift", 4, "5", 120),
        slot("squat", 3, "10", 120),
        slot("lunge", 3, "10 each leg", 90),
        slot("calves", 3, "15", 60),
        slot("core", 3, "30s", 45),
      ]),
    ],
  },
  {
    key: "strength-basics",
    name: "Strength Basics",
    description: "Three sessions built around heavy sets of five on the big compound lifts.",
    goals: ["get_stronger"],
    levels: ["intermediate", "advanced"],
    days: [
      day("mon", "Day A", [
        slot("squat", 5, "5", 180),
        slot("horizontal_push", 5, "5", 180),
        slot("horizontal_pull", 5, "5", 150),
      ]),
      day("wed", "Day B", [
        slot("deadlift", 3, "5", 180),
        slot("vertical_push", 5, "5", 180),
        slot("vertical_pull", 3, "6-8", 120),
      ]),
      day("fri", "Day A (repeat)", [
        slot("squat", 5, "5", 180),
        slot("horizontal_push", 5, "5", 180),
        slot("horizontal_pull", 5, "5", 150),
      ]),
    ],
  },
  {
    key: "push-pull-legs",
    name: "Push Pull Legs",
    description: "Six sessions: each muscle group is trained twice a week with plenty of volume.",
    goals: ["build_muscle"],
    levels: ["intermediate", "advanced"],
    days: [
      day("mon", "Push", [
        slot("horizontal_push", 4, "8", 120),
        slot("vertical_push", 3, "10", 90),
        slot("lateral_raise", 3, "12-15", 60),
        slot("triceps", 3, "12", 60),
      ]),
      day("tue", "Pull", [
        slot("vertical_pull", 4, "8", 120),
        slot("horizontal_pull", 3, "10", 90),
        slot("biceps", 3, "12", 60),
        slot("core", 3, "30s", 45),
      ]),
      day("wed", "Legs", [
        slot("squat", 4, "8", 120),
        slot("hinge", 3, "10", 120),
        slot("lunge", 3, "10 each leg", 90),
        slot("calves", 3, "15", 60),
      ]),
      day("thu", "Push", [
        slot("vertical_push", 4, "8", 120),
        slot("horizontal_push", 3, "10", 90),
        slot("lateral_raise", 3, "12-15", 60),
        slot("triceps", 3, "12", 60),
      ]),
      day("fri", "Pull", [
        slot("horizontal_pull", 4, "8", 120),
        slot("vertical_pull", 3, "10", 90),
        slot("biceps", 3, "12", 60),
        slot("core", 3, "30s", 45),
      ]),
      day("sat", "Legs", [
        slot("deadlift", 3, "6", 120),
        slot("squat", 3, "10", 120),
        slot("lunge", 3, "10 each leg", 90),
        slot("calves", 3, "15", 60),
      ]),
    ],
  },
  {
    key: "fat-loss-circuits",
    name: "Fat-Loss Circuits",
    description: "Three fast circuits with short rests to keep your heart rate up.",
    goals: ["lose_fat", "general_fitness"],
    levels: ["beginner", "intermediate", "advanced"],
    days: [
      day("mon", "Circuit A", [
        slot("squat", 3, "15", 30),
        slot("horizontal_push", 3, "12", 30),
        slot("conditioning", 3, "40s", 30),
        slot("lunge", 3, "10 each leg", 30),
        slot("core", 3, "40s", 30),
        slot("hinge", 3, "15", 30),
      ]),
      day("wed", "Circuit B", [
        slot("hinge", 3, "15", 30),
        slot("horizontal_pull", 3, "12", 30),
        slot("conditioning", 3, "40s", 30),
        slot("squat", 3, "15", 30),
        slot("vertical_push", 3, "12", 30),
        slot("core", 3, "40s", 30),
      ]),
      day("fri", "Circuit C", [
        slot("lunge", 3, "12 each leg", 30),
        slot("horizontal_push", 3, "12", 30),
        slot("conditioning", 3, "40s", 30),
        slot("horizontal_pull", 3, "12", 30),
        slot("hinge", 3, "15", 30),
        slot("core", 3, "40s", 30),
      ]),
    ],
  },
  {
    key: "four-day-muscle-builder",
    name: "Four-Day Muscle Builder",
    description: "A beginner-friendly upper/lower split with moderate weights and higher reps.",
    goals: ["build_muscle", "general_fitness"],
    levels: ["beginner", "intermediate"],
    days: [
      day("mon", "Upper", [
        slot("horizontal_push", 3, "10", 90),
        slot("horizontal_pull", 3, "10", 90),
        slot("vertical_push", 3, "10", 90),
        slot("lateral_raise", 2, "15", 60),
        slot("biceps", 2, "12", 60),
        slot("triceps", 2, "12", 60),
      ]),
      day("tue", "Lower", [
        slot("squat", 3, "10", 90),
        slot("hinge", 3, "10", 90),
        slot("lunge", 3, "10 each leg", 90),
        slot("calves", 3, "15", 60),
        slot("core", 3, "30s", 45),
      ]),
      day("thu", "Upper", [
        slot("vertical_push", 3, "10", 90),
        slot("vertical_pull", 3, "10", 90),
        slot("horizontal_push", 3, "12", 90),
        slot("lateral_raise", 2, "15", 60),
        slot("biceps", 2, "12", 60),
        slot("triceps", 2, "12", 60),
      ]),
      day("fri", "Lower", [
        slot("deadlift", 3, "8", 90),
        slot("lunge", 3, "10 each leg", 90),
        slot("squat", 3, "12", 90),
        slot("calves", 3, "15", 60),
        slot("core", 3, "30s", 45),
      ]),
    ],
  },
];
