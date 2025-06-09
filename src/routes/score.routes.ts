import { Router } from "express";
import { ScoreController } from "../controllers/score.controller";
import { upload } from "../middlewares/upload.middleware";
import { isAuthenticate } from "../middlewares/auth.middleware";

const router = Router()

// Ruta para crear una partitura
router.post('/newScore', isAuthenticate, upload, ScoreController.create);

export default router