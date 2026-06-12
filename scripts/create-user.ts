// Bootstrap de usuário: cria ou atualiza um User direto no banco.
// Uso: npx tsx scripts/create-user.ts <email> <senha> <nome> [admin|comum] [cargo?]
// Exemplos:
//   npx tsx scripts/create-user.ts pedro@cv.org "senha123" "Pedro Silva" admin "Diretor"
//   npx tsx scripts/create-user.ts joao@cv.org "outra123" "João" comum

import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const [email, senha, nome, roleArg = "admin", cargo] = process.argv.slice(2);

  if (!email || !senha || !nome) {
    console.error(
      "Uso: npx tsx scripts/create-user.ts <email> <senha> <nome> [admin|comum] [cargo?]",
    );
    process.exit(1);
  }

  const role = roleArg.toUpperCase() === "ADMIN" ? "ADMIN" : "COMUM";
  const senhaHash = await hash(senha, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, nome, senhaHash, role, cargo: cargo ?? null },
    update: { nome, senhaHash, role, cargo: cargo ?? null },
    select: { id: true, email: true, nome: true, role: true, cargo: true },
  });

  console.log("✓ Usuário pronto:", user);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
