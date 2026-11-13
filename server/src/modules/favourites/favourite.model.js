import mongoose from "mongoose";
import { cleanJSON } from "../../utils/cleanJSON.js";

// Collection: "favourites". One document per (user, wger exercise).
// The exercise's name, muscles and equipment are copied from wger when it is
// saved, so the favourites list still works if wger is unavailable.
const favouriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exerciseId: { type: Number, required: true, min: 1 },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: null },
    muscles: { type: [String], default: [] },
    equipment: { type: [String], default: [] },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true, toJSON: cleanJSON },
);

// The same user cannot favourite the same exercise twice.
favouriteSchema.index({ user: 1, exerciseId: 1 }, { unique: true });

export const Favourite = mongoose.model("Favourite", favouriteSchema);
