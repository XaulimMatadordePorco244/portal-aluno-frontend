import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();


export async function handleDeleteUser(userId: string) {
  
  if (!userId) {
    throw new Error("ID do usuário é obrigatório");
  }

  try {
    const usuarioInativado = await prisma.usuario.update({
      where: {
        id: userId,
      },
      data: {
              status: 'INATIVO', 
            passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    console.log("Usuário inativado com sucesso:", usuarioInativado.id);
    return usuarioInativado;

  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      console.error("Usuário não encontrado para inativar.");
    } else {
      console.error("Erro ao inativar usuário:", error);
    }
    throw error;
  }
}