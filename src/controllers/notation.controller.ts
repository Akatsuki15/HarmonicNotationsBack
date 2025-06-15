import { NotationService } from "../services/notation.service";
import { Request, Response } from "express";

export class NotationController{
    static async create(req: Request, res: Response): Promise<void> {
        try {
            console.log('Request body:', req.body);
            const { scoreId, content } = req.body;
            console.log('Destructured:', { scoreId, content });
            
            if (!scoreId || !content) {
                console.log('Validation failed:', { scoreId, content });
                res.status(400).json({ error: 'Score ID and content are required' });
                return;
            }
            const notationData = await NotationService.create(scoreId, content);
            res.status(201).json(notationData);
        } catch (error: any) {
            console.error('Error in NotationController.create:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getByScore(req: Request, res: Response): Promise<void> {
        try {
            const { score_id } = req.params;
            console.log('Getting notations for score_id:', score_id);
            const notationData = await NotationService.getByScore(score_id);
            console.log('Notation data:', notationData);
            res.status(200).json(notationData);
        } catch (error: any) {
            console.error('Error in NotationController.getByScore:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req: Request, res: Response){
        const { id } = req.params;
        const { notation } = req.body;
        const notationData = await NotationService.update(id, notation);
        res.status(200).json(notationData);
    }
}