import { ApiError } from "../../utils/ApiError.js";
import { muscleName, toExerciseDetail, toExerciseSummary } from "./exercise.mapper.js";
import { toPositiveInt, validateExerciseQuery } from "./exercise.validation.js";
import { wgerGet } from "./wger.client.js";

// GET /api/v1/exercises?search=squat&muscle=10&equipment=3&page=1&limit=20
export async function listExercises(req, res) {
  const { errors, value } = validateExerciseQuery(req.query);
  if (Object.keys(errors).length) throw new ApiError(400, "Validation failed", errors);

  const data = await wgerGet("/exerciseinfo/", {
    name__search: value.search,
    muscles: value.muscle,
    equipment: value.equipment,
    limit: value.limit,
    offset: (value.page - 1) * value.limit,
  });

  res.json({
    success: true,
    data: {
      exercises: data.results.map(toExerciseSummary),
      page: value.page,
      limit: value.limit,
      total: data.count,
      totalPages: Math.ceil(data.count / value.limit),
    },
  });
}

// GET /api/v1/exercises/filters
// The muscle and equipment lists used for the filter chips.
export async function listFilters(req, res) {
  const [muscles, equipment] = await Promise.all([
    wgerGet("/muscle/", { limit: 100 }),
    wgerGet("/equipment/", { limit: 100 }),
  ]);

  res.json({
    success: true,
    data: {
      muscles: muscles.results.map((m) => ({ id: m.id, name: muscleName(m) })),
      equipment: equipment.results.map((e) => ({ id: e.id, name: e.name })),
    },
  });
}

// GET /api/v1/exercises/:id
export async function getExercise(req, res) {
  const id = toPositiveInt(req.params.id);
  if (id === null) throw new ApiError(400, "Exercise id must be a whole number, e.g. 73");

  const info = await wgerGet(`/exerciseinfo/${id}/`);
  res.json({ success: true, data: { exercise: toExerciseDetail(info) } });
}
