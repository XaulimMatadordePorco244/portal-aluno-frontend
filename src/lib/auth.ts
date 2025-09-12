// src/lib/auth.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


interface UserPayload {
  userId: string;
  nome: string;
  cargo: string;
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não está definida.");
    }
    
    // Decodifica e valida o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as UserPayload;
    
    // Retorna os dados do usuário que já estão salvos dentro do token
    return decoded;

  } catch (error) {
    console.error("Falha ao verificar o token:", error);
    return null;
  }
}