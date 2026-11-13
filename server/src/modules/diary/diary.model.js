import mongoose from "mongoose";
import { cleanJSON } from "../../utils/cleanJSON.js";

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

// Collection: "diaryentries". Stores a snapshot of nutrition at the time of logging
// so editing a recipe later never changes past diary entries (requirement 4.5).
const diaryEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // YYYY-MM-DD local date
    mealType: { type: String, enum: MEAL_TYPES, required: true },
    sourceType: {
      type: String,
      enum: ["recipe", "custom", "photo", "planned", "catalogue"],
      default: "recipe",
    },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", default: null },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    portions: { type: Number, required: true, min: 0.01 }, // servings or grams logged
    portionUnit: { type: String, enum: ["serving", "g"], required: true },
    calories: { type: Number, required: true, min: 0 },
    proteinGrams: { type: Number, required: true, min: 0 },
    carbsGrams: { type: Number, required: true, min: 0 },
    fatGrams: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, toJSON: cleanJSON },
);

diaryEntrySchema.index({ user: 1, date: -1 });

export const DiaryEntry = mongoose.model("DiaryEntry", diaryEntrySchema);