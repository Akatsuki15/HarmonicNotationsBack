import { Request, Response } from 'express';
import { ScoreService } from '../services/score.service';
import { CustomJwtPayload } from '../utils/CustomJwtPayload';

export class ScoreController {
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const score = await ScoreService.getById(id);
            res.json(score);
        } catch (error: any) {
            res.status(error.message === 'Score not found' ? 404 : 500)
                .json({ error: error.message });
        }
    }

    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user as CustomJwtPayload;
            const scores = await ScoreService.getAllMyScores(user.id.toString());
            res.json(scores);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'PDF file is required' });
                return;
            }

            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }

            const user = req.user as CustomJwtPayload;
            const scoreData = {
                ...req.body,
                user_id: user.id.toString()
            };

            const score = await ScoreService.create(scoreData, req.file);
            res.status(201).json(score);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }

            const { id } = req.params;
            const scoreData = req.body;
            const score = await ScoreService.update(id, scoreData, req.file);
            res.json(score);
        } catch (error: any) {
            res.status(error.message === 'Score not found' ? 404 : 500)
                .json({ error: error.message });
        }
    }
}