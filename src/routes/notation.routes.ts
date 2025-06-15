import { Router } from "express";
import { NotationController } from "../controllers/notation.controller";
import { isAuthenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post('/', isAuthenticate, NotationController.create);
router.get('/:score_id', isAuthenticate, NotationController.getByScore);
router.put('/:id', isAuthenticate, NotationController.update);

export default router