import { supabase } from '../db/supabase';
import { HttpException } from '../exceptions/httpException';

interface User {
    id: string;
    name: string;
    email: string;
    created_at?: string;
    updated_at?: string;
}

export class UserService {
    static async getCurrentUser(userId: string): Promise<User> {
        try {
            const { data: user, error } = await supabase
                .from('Users')
                .select('id, name, email, created_at')
                .eq('id', userId)
                .single();

            if (error) {
                throw new HttpException(404, 'Usuario no encontrado');
            }

            if (!user) {
                throw new HttpException(404, 'Usuario no encontrado');
            }

            return user;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, 'Error al obtener el usuario');
        }
    }
}
