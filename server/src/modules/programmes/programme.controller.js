import { ApiError } from "../../utils/ApiError.js";
import { Programme } from "./programme.model.js";
import { generateProgrammes, toTemplateSummary } from "./programme.rules.js";
import { validateAnswers, validateProgramme, validateRename } from "./programme.validation.js";
import { ProgrammeTemplate } from "./programmeTemplate.model.js";

function failIfInvalid(errors) {
  if (Object.keys(errors).length) throw new ApiError(400, "Validation failed", errors);
}

async function loadTemplates() {
  const templates = await ProgrammeTemplate.find().sort({ name: 1 }).lean();
  if (!templates.length) {
    throw new ApiError(503, "Programme templates are not set up yet. Run `npm run seed:templates` in server/.");
  }
  return templates;
}

// GET /api/v1/programmes/templates
export async function listTemplates(req, res) {
  const templates = await loadTemplates();
  res.json({ success: true, data: { templates: templates.map(toTemplateSummary) } });
}

// POST /api/v1/programmes/generate
// body: { goal, experience, equipment: [...], daysPerWeek, sessionMinutes }
// Nothing is saved: the user reviews and edits the proposal first.
export async function generate(req, res) {
  const { errors, value: answers } = validateAnswers(req.body);
  failIfInvalid(errors);

  const result = generateProgrammes(await loadTemplates(), answers);
  // "No template fits" is a valid answer, not an error, so it is still 200.
  res.json({ success: true, data: { answers, ...result } });
}

// POST /api/v1/programmes   (save the reviewed programme)
export async function createProgramme(req, res) {
  const { errors, value } = validateProgramme(req.body);
  failIfInvalid(errors);

  const template = await ProgrammeTemplate.findOne({ key: value.templateKey }).lean();
  if (!template) {
    throw new ApiError(400, "Validation failed", { templateKey: "No template has this key" });
  }

  const programme = await Programme.create({
    user: req.userId,
    name: value.name || template.name,
    templateKey: template.key,
    answers: value.answers,
    schedule: value.schedule,
  });
  res.status(201).json({ success: true, data: { programme } });
}

// GET /api/v1/programmes   (my saved programmes, newest first)
export async function listProgrammes(req, res) {
  const programmes = await Programme.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: { programmes } });
}

// Every query includes user: req.userId, so one user can never read,
// change or delete another user's programme. Someone else's id looks
// exactly like a missing one (404), which hides that it exists.
async function findOwnProgramme(req) {
  const programme = await Programme.findOne({ _id: req.params.id, user: req.userId });
  if (!programme) throw new ApiError(404, "Programme not found");
  return programme;
}

// GET /api/v1/programmes/:id
export async function getProgramme(req, res) {
  const programme = await findOwnProgramme(req);
  res.json({ success: true, data: { programme } });
}

// PATCH /api/v1/programmes/:id   body: { name }
export async function renameProgramme(req, res) {
  const { errors, value } = validateRename(req.body);
  failIfInvalid(errors);

  const programme = await findOwnProgramme(req);
  programme.name = value.name;
  await programme.save();
  res.json({ success: true, data: { programme } });
}

// DELETE /api/v1/programmes/:id
export async function deleteProgramme(req, res) {
  const programme = await findOwnProgramme(req);
  await programme.deleteOne();
  res.json({ success: true, data: { id: programme.id, deleted: true } });
}
