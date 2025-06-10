import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { isAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

// Ruta protegida que requiere autenticación
router.get('/me', isAuthenticate, UserController.getCurrentUser);

export default router;
