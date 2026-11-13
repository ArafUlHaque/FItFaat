import { Router } from "express";
import { getExercise, listExercises, listFilters } from "./exercise.controller.js";

// Exercise information is public (it comes from wger), so no sign-in is needed.
const router = Router();

router.get("/", listExercises);
router.get("/filters", listFilters); // must come before "/:id", or "filters" is read as an id
router.get("/:id", getExercise);

export default router;
