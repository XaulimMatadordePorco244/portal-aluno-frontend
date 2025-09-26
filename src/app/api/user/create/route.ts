import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();

   
    if (Array.isArray(body)) {
  
      for (const user of body) {
        if (!user.nome || !user.cpf || !user.password) {
          return NextResponse.json(
            { error: `Um dos usuários na lista está incompleto. Faltando nome, CPF ou senha.` },
            { status: 400 }
          );
        }
      }

 
      const usersData = await Promise.all(
        body.map(async (user) => {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          return {
            ...user,
            password: hashedPassword,
          };
        })
      );


      const result = await prisma.user.createMany({
        data: usersData,
        skipDuplicates: true, 
      });

      return NextResponse.json({
        message: `${result.count} usuários criados com sucesso.`,
      });
    }
    

    else {
      const { nome, cpf, password, ...rest } = body;

      if (!nome || !cpf || !password) {
        return NextResponse.json(
          { error: "CPF, senha e nome são obrigatórios" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await prisma.user.create({
        data: {
          nome,
          cpf,
          password: hashedPassword,
          ...rest,
        }
      });

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Erro na criação de usuário(s):", error);
    
    return NextResponse.json(
      { error: 'Ocorreu um erro interno no servidor ao processar a requisição.' },
      { status: 500 }
    );
  }
}