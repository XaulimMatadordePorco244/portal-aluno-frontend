import { NextRequest, NextResponse } from 'next/server';
import { handleDeleteUser } from '@/lib/user-actions';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const result = await handleDeleteUser(userId);
    
    return NextResponse.json(
      { message: 'Usuário inativado com sucesso', user: result },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao inativar usuário:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}