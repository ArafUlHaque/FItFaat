/*
 * Recipe nutrition calculator rules (requirement 4.5 & DESIGN.md)
 * ----------------------------------------------------------------
 * All functions here are pure (no database, no network) so they are easy to test.
 */

export const SPLIT_MODES = ["servings", "cooked_weight"];

function round1(num) {
  return Math.round((num + Number.EPSILON) * 10) / 10;
}

// Supports both direct ingredient macros OR per-100g catalogue values scaled by `grams`.
export function resolveIngredientNutrition(item) {
  const grams = Number(item.grams) || 0;
  const scale = grams / 100;

  const calories =
    item.calories !== undefined ? item.calories : Math.round((item.caloriesPer100g || 0) * scale);
  const proteinGrams =
    item.proteinGrams !== undefined ? item.proteinGrams : round1((item.proteinPer100g || 0) * scale);
  const carbsGrams =
    item.carbsGrams !== undefined ? item.carbsGrams : round1((item.carbsPer100g || 0) * scale);
  const fatGrams =
    item.fatGrams !== undefined ? item.fatGrams : round1((item.fatPer100g || 0) * scale);

  return {
    name: item.name,
    grams: round1(grams),
    calories: Math.round(calories),
    proteinGrams: round1(proteinGrams),
    carbsGrams: round1(carbsGrams),
    fatGrams: round1(fatGrams),
  };
}

export function calculateRecipeTotals(ingredients = []) {
  const resolved = ingredients.map(resolveIngredientNutrition);
  const raw = resolved.reduce(
    (acc, item) => ({
      rawWeightGrams: acc.rawWeightGrams + item.grams,
      calories: acc.calories + item.calories,
      proteinGrams: acc.proteinGrams + item.proteinGrams,
      carbsGrams: acc.carbsGrams + item.carbsGrams,
      fatGrams: acc.fatGrams + item.fatGrams,
    }),
    { rawWeightGrams: 0, calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 },
  );

  return {
    ingredientCount: resolved.length,
    rawWeightGrams: round1(raw.rawWeightGrams),
    calories: Math.round(raw.calories),
    proteinGrams: round1(raw.proteinGrams),
    carbsGrams: round1(raw.carbsGrams),
    fatGrams: round1(raw.fatGrams),
  };
}

// Calculates estimated nutrition per portion + macro bar percentages for the Figma card.
export function calculatePerPortion(totals, { splitMode, servings, cookedWeightGrams }) {
  const divisor = splitMode === "cooked_weight" ? cookedWeightGrams / 100 : servings;

  const calories = Math.round(totals.calories / divisor);
  const proteinGrams = round1(totals.proteinGrams / divisor);
  const carbsGrams = round1(totals.carbsGrams / divisor);
  const fatGrams = round1(totals.fatGrams / divisor);

  const macroSum = proteinGrams + carbsGrams + fatGrams;
  const macroBar =
    macroSum > 0
      ? {
          proteinPercent: Math.round((proteinGrams / macroSum) * 100),
          carbsPercent: Math.round((carbsGrams / macroSum) * 100),
          fatPercent: Math.max(0, 100 - Math.round((proteinGrams / macroSum) * 100) - Math.round((carbsGrams / macroSum) * 100)),
        }
      : { proteinPercent: 0, carbsPercent: 0, fatPercent: 0 };

  return {
    basis: splitMode === "cooked_weight" ? "per 100g cooked" : "per serving",
    calories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    macroBar,
  };
}

export function withNutrition(recipeDoc) {
  const recipe = typeof recipeDoc.toJSON === "function" ? recipeDoc.toJSON() : { ...recipeDoc };
  const ingredients = (recipe.ingredients || []).map(resolveIngredientNutrition);
  const totals = calculateRecipeTotals(ingredients);
  const perPortion = calculatePerPortion(totals, recipe);
  return { ...recipe, ingredients, totals, perPortion };
}

export function calculateDiaryPortion(recipe, amount = 1) {
  const totals = calculateRecipeTotals(recipe.ingredients);
  const factor =
    recipe.splitMode === "cooked_weight"
      ? amount / recipe.cookedWeightGrams
      : amount / recipe.servings;

  return {
    portions: round1(amount),
    portionUnit: recipe.splitMode === "cooked_weight" ? "g" : "serving",
    calories: Math.round(totals.calories * factor),
    proteinGrams: round1(totals.proteinGrams * factor),
    carbsGrams: round1(totals.carbsGrams * factor),
    fatGrams: round1(totals.fatGrams * factor),
  };
}