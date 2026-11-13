import mongoose from "mongoose";
import { cleanJSON } from "../../utils/cleanJSON.js";
import { SPLIT_MODES } from "./recipe.rules.js";

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    grams: { type: Number, required: true, min: 0.01 },
    calories: { type: Number, required: true, min: 0 },
    proteinGrams: { type: Number, required: true, min: 0, default: 0 },
    carbsGrams: { type: Number, required: true, min: 0, default: 0 },
    fatGrams: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

// Collection: "recipes". Homemade recipes saved by the signed-in user.
const recipeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    notes: { type: String, default: "", maxlength: 500 },
    splitMode: { type: String, enum: SPLIT_MODES, default: "servings" },
    servings: { type: Number, default: null, min: 0.01 },
    cookedWeightGrams: { type: Number, default: null, min: 0.01 },
    ingredients: { type: [ingredientSchema], required: true },
  },
  { timestamps: true, toJSON: cleanJSON },
);

recipeSchema.index({ user: 1, createdAt: -1 });

export const Recipe = mongoose.model("Recipe", recipeSchema);