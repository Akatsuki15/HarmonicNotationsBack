import { AuthService } from "../services/auth.service";
import {Response, Request, NextFunction} from 'express'
import jwt from "jsonwebtoken";

const TOKEN_PASSWORD = process.env.TOKEN_PASSWORD || 'pass'

export class AuthController{
    static async register(req: Request, res: Response) {
        try {
            const userData = req.body;

            const { token, user } = await AuthService.register(userData);

            const validSameSiteValues = ["none", "lax", "strict"] as const; // Valores permitidos

            const sameSiteValue: "none" | "lax" | "strict" = validSameSiteValues.includes(process.env.COOKIE_SAME_SITE as "none" | "lax" | "strict")
            ? (process.env.COOKIE_SAME_SITE as "none" | "lax" | "strict")
            : "none"; // Si no es válido, usa "none" por defecto

            res.cookie('token', token, {
                maxAge: 60 * 60 * 1000 * 3, // 3 horas de caducidad
                httpOnly: true, // no se puede accerder mediante js
                secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : true,// solo se envia si usas https
                sameSite: sameSiteValue, // Evita ataques CSRF

            })
            res.status(201).json({ message: 'Register successfully:', user })
        } catch (error: unknown) {
            // Extraemos mensaje de error de forma segura
            let errorMessage = 'Ocurrió un error desconocido';
            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null) {
                errorMessage = (error as any).message || (error as any).details || JSON.stringify(error);
            }

            console.error('Error al registrar usuario:', error);

            res.status(409).json({
                message: 'Fallo al registrar al usuario',
                error: errorMessage
            });
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const userData = req.body
            console.log(userData.email)
            const { token, user } = await AuthService.login(userData.email, userData.password)
            //TODO inyectar cookie al cliente
            console.log(token, user)

            const validSameSiteValues = ["none", "lax", "strict"] as const; // Valores permitidos

            const sameSiteValue: "none" | "lax" | "strict" = validSameSiteValues.includes(process.env.COOKIE_SAME_SITE as "none" | "lax" | "strict")
            ? (process.env.COOKIE_SAME_SITE as "none" | "lax" | "strict")
            : "none"; // Si no es válido, usa "none" por defecto

            res.cookie('token', token, {
                maxAge: 60 * 60 * 1000 * 3, // 3 horas de caducidad
                httpOnly: true, // no se puede accerder mediante js
                secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : true,// solo se envia si usas https
                sameSite: sameSiteValue, // Evita ataques CSRF

            })
            res.status(201).json({ message: 'Login successfully:', user })
        } catch (error) {
            next(error)
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction){
        try {
            res.clearCookie('token')
            res.status(200).json({message:'Logout successfully'})
        } catch (error) {
            next(error)
        }
    }

    static async getAuthenticatedUser (req: Request, res: Response, next: NextFunction){
        try {
            const token = req.cookies.token;
            if (!token)  res.status(401).json({ message: "No autenticado" });
            const decoded = jwt.verify(token, TOKEN_PASSWORD);
            res.status(200).json(decoded)
        } catch (error) {
            next(error)
        }
    };
}