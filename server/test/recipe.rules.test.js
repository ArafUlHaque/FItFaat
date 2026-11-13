import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateDiaryPortion,
  calculatePerPortion,
  calculateRecipeTotals,
} from "../src/modules/recipes/recipe.rules.js";
import { validateRecipe, validateRecipeLog } from "../src/modules/recipes/recipe.validation.js";

const sampleIngredients = [
  { name: "Chicken breast", grams: 400, calories: 660, proteinGrams: 124, carbsGrams: 0, fatGrams: 14.4 },
  { name: "Cooked rice", grams: 600, calories: 780, proteinGrams: 16.2, carbsGrams: 168, fatGrams: 1.8 },
];

test("calculateRecipeTotals sums grams, calories, and macros", () => {
  const totals = calculateRecipeTotals(sampleIngredients);
  assert.deepEqual(totals, {
    ingredientCount: 2,
    rawWeightGrams: 1000,
    calories: 1440,
    proteinGrams: 140.2,
    carbsGrams: 168,
    fatGrams: 16.2,
  });
});

test("calculatePerPortion divides by servings or per 100g cooked weight and computes macroBar", () => {
  const totals = calculateRecipeTotals(sampleIngredients);

  const byServings = calculatePerPortion(totals, { splitMode: "servings", servings: 4 });
  assert.equal(byServings.basis, "per serving");
  assert.equal(byServings.calories, 360);
  assert.equal(byServings.proteinGrams, 35.1);
  assert.equal(byServings.carbsGrams, 42);
  assert.equal(byServings.fatGrams, 4.1);
  assert.equal(
    byServings.macroBar.proteinPercent + byServings.macroBar.carbsPercent + byServings.macroBar.fatPercent,
    100,
  );

  const byWeight = calculatePerPortion(totals, { splitMode: "cooked_weight", cookedWeightGrams: 800 });
  assert.equal(byWeight.basis, "per 100g cooked");
  assert.equal(byWeight.calories, 180);
});

test("calculateDiaryPortion snapshots nutrition so future recipe edits do not change it", () => {
  const recipe = {
    splitMode: "servings",
    servings: 4,
    ingredients: sampleIngredients,
  };
  const snapshot = calculateDiaryPortion(recipe, 1.5);
  assert.deepEqual(snapshot, {
    portions: 1.5,
    portionUnit: "serving",
    calories: 540,
    proteinGrams: 52.6,
    carbsGrams: 63,
    fatGrams: 6.1,
  });
});

test("validateRecipe rejects zero servings with exact Figma error message", () => {
  const { errors } = validateRecipe({
    name: "",
    splitMode: "servings",
    servings: 0,
    ingredients: [],
  });
  assert.ok(errors.name);
  assert.equal(errors.servings, "Enter at least 1 serving.");
  assert.ok(errors.ingredients);
});

test("validateRecipeLog defaults date and amount when omitted, and rejects invalid values", () => {
  assert.deepEqual(validateRecipeLog({}).errors, {});
  const { errors } = validateRecipeLog({ date: "13-11-2026", mealType: "midnight", amount: 0 });
  assert.deepEqual(Object.keys(errors).sort(), ["amount", "date", "mealType"]);
});