import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  createProgramme,
  deleteProgramme,
  generate,
  getProgramme,
  listProgrammes,
  listTemplates,
  renameProgramme,
} from "./programme.controller.js";

const router = Router();

// Public: templates and generating a proposal don't touch private records.
// These must come before "/:id", or "templates" would be read as an id.
router.get("/templates", listTemplates);
router.post("/generate", generate);

// Private: saved programmes belong to the signed-in user.
router.post("/", requireAuth, createProgramme);
router.get("/", requireAuth, listProgrammes);
router.get("/:id", requireAuth, getProgramme);
router.patch("/:id", requireAuth, renameProgramme);
router.delete("/:id", requireAuth, deleteProgramme);

export default router;
