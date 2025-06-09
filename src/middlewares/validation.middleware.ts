import { NextFunction, Request, Response } from "express"
import { validationResult } from "express-validator"

export const ValidationMiddleware = (req: Request, res: Response, next: NextFunction): any => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({error: errors.array()})
    }
    next()
}