import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function hashPasswords() {
  const users = await prisma.usuario.findMany();

  for (const user of users) {

    if (!user.password.startsWith("$2")) {

      const hashed = await bcrypt.hash(user.password, 10);

      await prisma.usuario.update({
        where: { id: user.id },
        data: {
          password: hashed
        }
      });

      console.log(`Senha atualizada para usuário: ${user.nome}`);
    }
  }

  console.log("Processo concluído");
}

hashPasswords();