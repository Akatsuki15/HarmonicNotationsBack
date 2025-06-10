import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { CustomJwtPayload } from '../utils/CustomJwtPayload';

export class UserController {
    static async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user as CustomJwtPayload;
            
            if (!user || !user.id) {
                res.status(401).json({ message: 'No autenticado' });
                return;
            }

            const userData = await UserService.getCurrentUser(user.id.toString());
            res.status(200).json(userData);
        } catch (error) {
            next(error);
        }
    }
}
