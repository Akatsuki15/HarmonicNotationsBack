import { CustomJwtPayload } from "@utils/CustomJwtPayload"
import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

const TOKEN_PASSWORD = process.env.TOKEN_PASSWORD || 'pass'

export const isAuthenticate = (req: Request, res: Response, next: NextFunction): any => {
    console.log('Cookies recibidas:', req.cookies);
    console.log('Headers:', req.headers);

    const token = req.cookies.token
    if(!token) {
        console.log('No se encontró el token en las cookies');
        return res.status(401).json({error: 'Access denied'})
    }

    try{
        console.log('Token encontrado:', token);
        const tokenDecodificado = jwt.verify(token, TOKEN_PASSWORD)
        console.log('Token decodificado:', tokenDecodificado);
        req.user = tokenDecodificado as CustomJwtPayload
        console.log('Usuario autenticado:', req.user)
        next()
    }catch(error){
        console.error('Error al verificar el token:', error);
        res.status(401).json({error:'Invalid token'})
    }
}