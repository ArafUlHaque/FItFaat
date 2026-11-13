// Copies the programme templates from templates.data.js into MongoDB.
// Run from server/:  npm run seed:templates
// Safe to run again: it updates templates by key instead of duplicating them.
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { ProgrammeTemplate } from "../modules/programmes/programmeTemplate.model.js";
import { PROGRAMME_TEMPLATES } from "../modules/programmes/templates.data.js";

await connectDB();

for (const template of PROGRAMME_TEMPLATES) {
  await ProgrammeTemplate.replaceOne({ key: template.key }, template, {
    upsert: true,
    runValidators: true,
  });
}

// Remove templates that were deleted from the data file.
const keys = PROGRAMME_TEMPLATES.map((t) => t.key);
const { deletedCount } = await ProgrammeTemplate.deleteMany({ key: { $nin: keys } });

console.log(`Saved ${keys.length} programme templates (${deletedCount} old ones removed).`);
await mongoose.disconnect();
