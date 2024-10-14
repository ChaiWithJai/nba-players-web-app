import express from "express";
import {
  getPlayers,
  getPlayerById,
  searchPlayers,
} from "../controllers/playerController";

const router = express.Router();

router.get("/", getPlayers);
// router.get("/search", searchPlayers);
router.get("/:id", getPlayerById);

export default router;
