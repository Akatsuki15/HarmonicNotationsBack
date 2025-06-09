// src/services/authService.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabase';
import { HttpException } from '../exceptions/httpException';

const TOKEN_PASSWORD = process.env.TOKEN_PASSWORD || 'pass'

interface User {
  id?: string
  name: string
  email: string
  password: string
}

export class AuthService {
  static async register(user: User) {
    const { email, password, name } = user;

    // Verificar si ya existe email
    const { data: existingUser, error: findError } = await supabase
        .from('Users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (findError) throw findError;
    if (existingUser) throw new Error(`${email} already exists`);

    // Hashear contraseña
    const passwordEncrypted = await bcrypt.hash(password, 10);

    // Crear usuario en Supabase
    const { data: newUser, error: insertError } = await supabase
        .from('Users')
        .insert([
        {
            name,
            email,
            password: passwordEncrypted
        }
        ])
        .select('id, email, name')
        .single();

    if (insertError) throw insertError;

    // Generar JWT
    const token = jwt.sign(
        {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        },
        TOKEN_PASSWORD,
        { expiresIn: '5h' }
    );

    return {
        token,
        user: newUser
    };
  }

  static async login(email: string, password: string) {
    // Buscar usuario
    const { data: user, error } = await supabase
      .from('Users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new HttpException(401, 'Invalid user or password');
    }

    // Comparar contraseñas
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new HttpException(401, 'Invalid user or password');
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email
      },
      TOKEN_PASSWORD,
      { expiresIn: '5h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }
}