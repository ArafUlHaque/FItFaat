import { ApiError } from "../../utils/ApiError.js";
import { toExerciseSummary } from "../exercises/exercise.mapper.js";
import { toPositiveInt } from "../exercises/exercise.validation.js";
import { wgerGet } from "../exercises/wger.client.js";
import { Favourite } from "./favourite.model.js";

// All routes here use requireAuth, so req.userId is the signed-in user.
// Ownership always comes from the token, never from the request body.

// GET /api/v1/favourites
export async function listFavourites(req, res) {
  const favourites = await Favourite.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: { favourites } });
}

// POST /api/v1/favourites   body: { "exerciseId": 73 }
export async function addFavourite(req, res) {
  const exerciseId = toPositiveInt(req.body?.exerciseId);
  if (exerciseId === null) {
    throw new ApiError(400, "Validation failed", {
      exerciseId: "exerciseId must be a wger exercise id, e.g. 73",
    });
  }

  if (await Favourite.exists({ user: req.userId, exerciseId })) {
    throw new ApiError(409, "This exercise is already in your favourites");
  }

  // Look the exercise up on wger: this proves it exists and gives us its real
  // name and muscles (we don't trust names typed by the client).
  const exercise = toExerciseSummary(await wgerGet(`/exerciseinfo/${exerciseId}/`));

  const favourite = await Favourite.create({
    user: req.userId,
    exerciseId,
    name: exercise.name,
    category: exercise.category,
    muscles: exercise.muscles,
    equipment: exercise.equipment,
    imageUrl: exercise.imageUrl,
  });

  res.status(201).json({ success: true, data: { favourite } });
}

// DELETE /api/v1/favourites/:exerciseId
export async function removeFavourite(req, res) {
  const exerciseId = toPositiveInt(req.params.exerciseId);
  if (exerciseId === null) throw new ApiError(400, "Exercise id must be a whole number, e.g. 73");

  const result = await Favourite.deleteOne({ user: req.userId, exerciseId });
  if (result.deletedCount === 0) throw new ApiError(404, "This exercise is not in your favourites");

  res.json({ success: true, data: { exerciseId, removed: true } });
}
