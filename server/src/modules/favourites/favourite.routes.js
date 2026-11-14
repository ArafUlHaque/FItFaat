import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { addFavourite, listFavourites, removeFavourite } from "./favourite.controller.js";

// Favourites are private records, so every route needs a signed-in user.
const router = Router();
router.use(requireAuth);

router.get("/", listFavourites);
router.post("/", addFavourite);
router.delete("/:exerciseId", removeFavourite);

export default router;
