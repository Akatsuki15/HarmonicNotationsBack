import { body } from "express-validator"

export const registerValidation = [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({min: 4}).withMessage('Password too short'),
    body('name').notEmpty().withMessage('Name required')
]

export const loginValidation = [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password required')
]

export const bookValidation = [
    body('title').isLength({min: 4, max: 50}).withMessage('Titulo obligatorio minimo 4 caracteres'),
    body('author').isLength({min: 4, max: 50}).withMessage('Author is required'),
    body('description').optional().isLength({max: 1000}),
    body('opinion').isLength({min: 10, max: 2000}).withMessage('Opinion is required'),
    body('published').optional().isISO8601().withMessage('Formato de fecha incorrecto')
]

export const genreValidation = [
    body('name').notEmpty().withMessage('Name required')
]

export const rateValidation = [
    body('value').isInt({min: 0, max: 5}).toInt().withMessage('Value is required')
]