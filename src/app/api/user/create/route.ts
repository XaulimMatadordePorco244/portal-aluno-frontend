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


      const results = [];
      
      for (const user of body) {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        const { perfilAluno, ...userData } = user;
        
        const result = await prisma.usuario.create({
          data: {
            ...userData,
            password: hashedPassword,
            perfilAluno: perfilAluno ? {
              create: perfilAluno
            } : undefined
          },
          include: {
            perfilAluno: true
          }
        });
        
        results.push(result);
      }

      return NextResponse.json({
        message: `${results.length} usuários criados com sucesso.`,
        results
      });
    } else {
      const { nome, cpf, password, perfilAluno, ...rest } = body;

      if (!nome || !cpf || !password) {
        return NextResponse.json(
          { error: "CPF, senha e nome são obrigatórios" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await prisma.usuario.create({
        data: {
          nome,
          cpf,
          password: hashedPassword,
          ...rest,
          perfilAluno: perfilAluno ? {
            create: perfilAluno
          } : undefined
        },
        include: {
          perfilAluno: true
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