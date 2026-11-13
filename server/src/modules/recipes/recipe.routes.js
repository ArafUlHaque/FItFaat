import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  listRecipes,
  logRecipePortion,
  updateRecipe,
} from "./recipe.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", listRecipes);
router.post("/", createRecipe);
router.get("/:id", getRecipe);
router.put("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);
router.post("/:id/log", logRecipePortion);

export default router;