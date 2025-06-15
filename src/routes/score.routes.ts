import { Router } from "express";
import { ScoreController } from "../controllers/score.controller";
import { isAuthenticate } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router()

// Obtener todas las partituras
router.get('/', isAuthenticate, ScoreController.getAll);

// Obtener una partitura por ID
router.get('/:id', isAuthenticate, ScoreController.getById);

// Crear una nueva partitura (requiere autenticación y archivo PDF)
router.post('/newScore', isAuthenticate, upload, ScoreController.create);

// Actualizar una partitura (requiere autenticación)
router.put('/:id', isAuthenticate, upload, ScoreController.update);

export default router