import mongoose from "mongoose";
import { cleanJSON } from "../../utils/cleanJSON.js";
import { WEEKDAYS } from "./programme.constants.js";

// Collection: "programmes". A programme the user generated, reviewed and saved.

const exerciseSchema = new mongoose.Schema(
  {
    pattern: { type: String }, // e.g. "squat", used to offer swaps later
    exerciseId: { type: Number, required: true }, // wger exercise id
    name: { type: String, required: true, trim: true },
    sets: { type: Number, required: true, min: 1, max: 10 },
    reps: { type: String, required: true, trim: true },
    restSeconds: { type: Number, required: true, min: 0, max: 600 },
  },
  { _id: false },
);

const daySchema = new mongoose.Schema(
  {
    weekday: { type: String, enum: WEEKDAYS, required: true },
    title: { type: String, required: true, trim: true },
    exercises: { type: [exerciseSchema], required: true },
  },
  { _id: false },
);

const programmeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    templateKey: { type: String, required: true },
    // The quiz answers the programme was generated from.
    answers: {
      goal: { type: String, required: true },
      experience: { type: String, required: true },
      equipment: { type: [String], default: [] },
      daysPerWeek: { type: Number, required: true },
      sessionMinutes: { type: Number, required: true },
    },
    schedule: { type: [daySchema], required: true },
  },
  { timestamps: true, toJSON: cleanJSON },
);

programmeSchema.index({ user: 1, createdAt: -1 });

export const Programme = mongoose.model("Programme", programmeSchema);
