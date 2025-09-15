
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';



export async function POST() {
  try {

    (await
       
          cookies()).set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: -1, 
      path: '/',
    });

    return NextResponse.json({ message: 'Logout bem-sucedido' }, { status: 200 });

  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}