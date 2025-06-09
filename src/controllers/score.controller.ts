import { Request, Response, NextFunction } from 'express';
import { ScoreService } from '../services/score.service';

export class ScoreController {
    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('File received:', req.file);
            console.log('Request body:', req.body);

            // Verificar que se haya subido el archivo PDF
            if (!req.file) {
                console.log('No PDF file found in request');
                res.status(400).json({
                    message: 'PDF file is required'
                });
                return;
            }

            const pdfFile = req.file;
            console.log('PDF file details:', {
                originalname: pdfFile.originalname,
                mimetype: pdfFile.mimetype,
                size: pdfFile.size
            });

            // Verificar que el archivo sea del tipo correcto
            if (pdfFile.mimetype !== 'application/pdf') {
                res.status(400).json({
                    message: 'File must be in PDF format'
                });
                return;
            }

            // Obtener el user_id del token (asumiendo que está disponible en req.user)
            const user_id = (req as any).user.id;

            // Crear el objeto de datos de la partitura
            const scoreData = {
                ...req.body,
                user_id
            };

            // Llamar al servicio para crear la partitura
            const score = await ScoreService.create(scoreData, pdfFile);

            res.status(201).json({
                message: 'Score created successfully',
                score
            });
        } catch (error) {
            console.error('Error in create score:', error);
            next(error);
        }
    }
}