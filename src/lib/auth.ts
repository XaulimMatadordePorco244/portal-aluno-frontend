import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


interface UserPayload {
  userId: string;
  nome: string;
  nomeDeGuerra: string | null;
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
    
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as UserPayload;
    
  
    return decoded;

  } catch (error) {
    console.error("Falha ao verificar o token:", error);
    return null;
  }
}

export async function getFullCurrentUser() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser?.userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: sessionUser.userId,
      },
    });
    return user;
  } catch (error) {
    console.error("Erro ao buscar dados completos do usuário:", error);
    return null;
  }
}