import { NextResponse } from 'next/server';
import { getCurrentUserWithRelations } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUserWithRelations();
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const safeUser = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      perfilAluno: user.perfilAluno ? {
        id: user.perfilAluno.id,
        numero: user.perfilAluno.numero,
        nomeDeGuerra: user.perfilAluno.nomeDeGuerra,
        cargo: user.perfilAluno.cargo,
        companhia: user.perfilAluno.companhia,
        conceitoAtual: user.perfilAluno.conceitoAtual,
      } : null
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}