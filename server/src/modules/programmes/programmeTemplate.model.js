import mongoose from "mongoose";
import { cleanJSON } from "../../utils/cleanJSON.js";
import { WEEKDAYS } from "./programme.constants.js";

// Collection: "programmetemplates". Filled by `npm run seed:templates`
// from templates.data.js. Read-only for the API.

const optionSchema = new mongoose.Schema(
  {
    exerciseId: { type: Number, required: true }, // wger exercise id
    name: { type: String, required: true },
    equipment: { type: [String], default: [] }, // [] = bodyweight
  },
  { _id: false },
);

const slotSchema = new mongoose.Schema(
  {
    pattern: { type: String, required: true }, // e.g. "squat"
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    restSeconds: { type: Number, required: true },
    options: { type: [optionSchema], required: true },
  },
  { _id: false },
);

const daySchema = new mongoose.Schema(
  {
    weekday: { type: String, enum: WEEKDAYS, required: true },
    title: { type: String, required: true },
    slots: { type: [slotSchema], required: true },
  },
  { _id: false },
);

const programmeTemplateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    goals: { type: [String], required: true }, // first = main goal
    levels: { type: [String], required: true },
    days: { type: [daySchema], required: true },
  },
  { timestamps: true, toJSON: cleanJSON },
);

export const ProgrammeTemplate = mongoose.model("ProgrammeTemplate", programmeTemplateSchema);
