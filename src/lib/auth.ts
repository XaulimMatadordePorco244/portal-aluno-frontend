import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient, User, Funcao, Cargo } from '@prisma/client';

const prisma = new PrismaClient();


interface UserPayload {
  userId: string;
  nome: string;
  nomeDeGuerra: string | null;
  cargo: string;
  role: string;
}

export async function getCurrentUser(): Promise<UserPayload | null> {
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


export type UserWithFuncao = User & {
    funcao: Funcao | null;
    cargo: Cargo | null;
};

export async function getCurrentUserWithRelations(): Promise<UserWithFuncao | null> {
  const sessionUser = await getCurrentUser(); 
  if (!sessionUser?.userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: sessionUser.userId,
      },
      include: {
        funcao: true,
        cargo: true, 
      },
    });
    return user as UserWithFuncao | null;
  } catch (error) {
    console.error("Erro ao buscar dados completos do usuário:", error);
    return null;
  }
}

export function canAccessAdminArea(user: UserWithFuncao | null): boolean {
    if (!user) {
        return false;
    }
    
    if (user.role === 'ADMIN') {
        return true;
    }

    if (user.funcao?.nome === 'Comandante Geral') {
        return true;
    }
    return false;
}