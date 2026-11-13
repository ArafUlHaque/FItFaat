import { MEAL_TYPES } from "../diary/diary.model.js";
import { todayLocalISO } from "../habits/habit.rules.js";
import { resolveIngredientNutrition, SPLIT_MODES } from "./recipe.rules.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const isText = (s, min, max) =>
  typeof s === "string" && s.trim().length >= min && s.trim().length <= max;
const isPositiveNumber = (n, max = 100000) =>
  typeof n === "number" && Number.isFinite(n) && n > 0 && n <= max;
const isNonNegativeNumber = (n, max = 100000) =>
  typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= max;

function validateIngredient(item, path, errors) {
  if (!item || typeof item !== "object") {
    errors[path] = "Each ingredient must be an object";
    return null;
  }

  if (!isText(item.name, 1, 80)) {
    errors[`${path}.name`] = "Ingredient name is required (up to 80 characters)";
  }
  if (!isPositiveNumber(item.grams, 50000)) {
    errors[`${path}.grams`] = "grams must be a number greater than 0";
  }

  // Allow either explicit calories/macros OR per-100g catalogue values
  const hasCalories = item.calories !== undefined || item.caloriesPer100g !== undefined;
  if (!hasCalories) {
    errors[`${path}.calories`] = "Provide calories (or caloriesPer100g)";
  } else if (item.calories !== undefined && !isNonNegativeNumber(item.calories, 50000)) {
    errors[`${path}.calories`] = "calories must be 0 or more";
  } else if (item.caloriesPer100g !== undefined && !isNonNegativeNumber(item.caloriesPer100g, 1000)) {
    errors[`${path}.caloriesPer100g`] = "caloriesPer100g must be between 0 and 1000";
  }

  for (const field of ["proteinGrams", "carbsGrams", "fatGrams"]) {
    if (item[field] !== undefined && !isNonNegativeNumber(item[field], 5000)) {
      errors[`${path}.${field}`] = `${field} must be 0 or more`;
    }
  }

  if (Object.keys(errors).some((k) => k.startsWith(path))) return null;

  return resolveIngredientNutrition({
    ...item,
    name: item.name.trim(),
  });
}

export function validateRecipe(body = {}) {
  const errors = {};

  if (!isText(body.name, 1, 80)) {
    errors.name = "Recipe name is required (1 to 80 characters)";
  }

  let notes = "";
  if (body.notes !== undefined && body.notes !== null) {
    if (typeof body.notes !== "string" || body.notes.trim().length > 500) {
      errors.notes = "notes must be 500 characters or fewer";
    } else {
      notes = body.notes.trim();
    }
  }

  const splitMode = body.splitMode ?? "servings";
  if (!SPLIT_MODES.includes(splitMode)) {
    errors.splitMode = `splitMode must be one of: ${SPLIT_MODES.join(", ")}`;
  }

  let servings = null;
  let cookedWeightGrams = null;

  if (splitMode === "servings") {
    if (!isPositiveNumber(body.servings, 1000) || body.servings < 1) {
      // Exact error string from Figma screen "Recipes — Desktop / Servings error"
      errors.servings = "Enter at least 1 serving.";
    } else {
      servings = body.servings;
    }
  } else if (splitMode === "cooked_weight") {
    if (!isPositiveNumber(body.cookedWeightGrams, 100000)) {
      errors.cookedWeightGrams = "Cooked weight (g) must be a number greater than zero";
    } else {
      cookedWeightGrams = body.cookedWeightGrams;
    }
  }

  const ingredients = [];
  if (
    !Array.isArray(body.ingredients) ||
    body.ingredients.length < 1 ||
    body.ingredients.length > 50
  ) {
    errors.ingredients = "ingredients must be a list of 1 to 50 items";
  } else {
    body.ingredients.forEach((item, index) => {
      const cleaned = validateIngredient(item, `ingredients[${index}]`, errors);
      if (cleaned) ingredients.push(cleaned);
    });
  }

  return {
    errors,
    value: {
      name: body.name?.trim?.(),
      notes,
      splitMode,
      servings,
      cookedWeightGrams,
      ingredients,
    },
  };
}

// Defaults `date` to today and `amount` to 1 so clicking "Log a serving" works out of the box.
export function validateRecipeLog(body = {}) {
  const errors = {};

  const date = body.date === undefined ? todayLocalISO() : body.date;
  if (typeof date !== "string" || !DATE_PATTERN.test(date.trim())) {
    errors.date = "date is required in YYYY-MM-DD format";
  }

  const mealType = body.mealType ?? "lunch";
  if (!MEAL_TYPES.includes(mealType)) {
    errors.mealType = `mealType must be one of: ${MEAL_TYPES.join(", ")}`;
  }

  const amount = body.amount ?? 1;
  if (!isPositiveNumber(amount, 10000)) {
    errors.amount = "amount (servings or grams) must be a number greater than zero";
  }

  return {
    errors,
    value: {
      date: typeof date === "string" ? date.trim() : todayLocalISO(),
      mealType,
      amount,
    },
  };
}