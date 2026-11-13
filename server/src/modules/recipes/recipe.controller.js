import { ApiError } from "../../utils/ApiError.js";
import { DiaryEntry } from "../diary/diary.model.js";
import { Recipe } from "./recipe.model.js";
import { calculateDiaryPortion, withNutrition } from "./recipe.rules.js";
import { validateRecipe, validateRecipeLog } from "./recipe.validation.js";

function failIfInvalid(errors) {
  if (Object.keys(errors).length) throw new ApiError(400, "Validation failed", errors);
}

async function findOwnRecipe(req) {
  const recipe = await Recipe.findOne({ _id: req.params.id, user: req.userId });
  if (!recipe) throw new ApiError(404, "Recipe not found");
  return recipe;
}

// GET /api/v1/recipes
export async function listRecipes(req, res) {
  const recipes = await Recipe.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: { recipes: recipes.map(withNutrition) } });
}

// POST /api/v1/recipes
export async function createRecipe(req, res) {
  const { errors, value } = validateRecipe(req.body);
  failIfInvalid(errors);

  const recipe = await Recipe.create({ user: req.userId, ...value });
  res.status(201).json({ success: true, data: { recipe: withNutrition(recipe) } });
}

// GET /api/v1/recipes/:id
export async function getRecipe(req, res) {
  const recipe = await findOwnRecipe(req);
  res.json({ success: true, data: { recipe: withNutrition(recipe) } });
}

// PUT /api/v1/recipes/:id
export async function updateRecipe(req, res) {
  const { errors, value } = validateRecipe(req.body);
  failIfInvalid(errors);

  const recipe = await findOwnRecipe(req);
  Object.assign(recipe, value);
  await recipe.save();

  res.json({ success: true, data: { recipe: withNutrition(recipe) } });
}

// DELETE /api/v1/recipes/:id
export async function deleteRecipe(req, res) {
  const recipe = await findOwnRecipe(req);
  await recipe.deleteOne();
  res.json({ success: true, data: { id: recipe.id, deleted: true } });
}

// POST /api/v1/recipes/:id/log
// Logs a portion of this recipe into the user's food diary as an independent snapshot.
export async function logRecipePortion(req, res) {
  const { errors, value } = validateRecipeLog(req.body);
  failIfInvalid(errors);

  const recipe = await findOwnRecipe(req);
  const snapshot = calculateDiaryPortion(recipe, value.amount);

  const entry = await DiaryEntry.create({
    user: req.userId,
    date: value.date,
    mealType: value.mealType,
    sourceType: "recipe",
    recipeId: recipe._id,
    name: recipe.name,
    ...snapshot,
  });

  res.status(201).json({ success: true, data: { entry } });
}