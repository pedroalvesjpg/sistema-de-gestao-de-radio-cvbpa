import NextAuth, { type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { ZodError } from "zod";
import { loginSchema } from "@/lib/schemas/auth";
import { prisma } from "@/lib/prisma";
import {
  chavesDeTentativa,
  excedeuTentativas,
  ipDaRequisicao,
  limparTentativas,
  registrarTentativa,
} from "@/lib/rate-limit";

// O papel mora no JWT, que dura 30 dias. Sem revalidar, rebaixar ou excluir
// alguém só faria efeito no próximo login. Conferimos no banco, mas espaçado:
// o callback `jwt` roda também no proxy, em toda rota e até em prefetch.
const REVALIDAR_APOS_MS = 60_000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await loginSchema.parseAsync(credentials);

          // O freio mora aqui, e não só na server action do formulário: este
          // endpoint é público e pode ser chamado direto, sem passar pela tela.
          const chaves = chavesDeTentativa(email, await ipDaRequisicao());
          if (await excedeuTentativas(chaves)) return null;

          const user = await prisma.user.findUnique({ where: { email } });
          const ok = user ? await compare(password, user.senhaHash) : false;

          if (!user || !ok) {
            await registrarTentativa(chaves);
            return null;
          }

          await limparTentativas(chaves);
          return {
            id: user.id.toString(),
            name: user.nome,
            email: user.email,
            role: user.role,
            cargo: user.cargo,
          };
        } catch (error) {
          if (error instanceof ZodError) return null;
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.cargo = user.cargo;
        token.revalidadoEm = Date.now();
        return token;
      }

      // Token emitido antes desta mudança não tem o carimbo: revalida na hora.
      const revalidadoEm =
        typeof token.revalidadoEm === "number" ? token.revalidadoEm : 0;
      const vencido =
        trigger === "update" || Date.now() - revalidadoEm > REVALIDAR_APOS_MS;
      if (!vencido) return token;

      const id = Number(token.id);
      if (!Number.isInteger(id)) return null;

      try {
        const atual = await prisma.user.findUnique({
          where: { id },
          select: { nome: true, email: true, role: true, cargo: true },
        });

        // Usuário excluído: derruba a sessão. Deixá-la viva daria um token
        // órfão que passa no requireUser() e só quebra na FK de `criadoPorId`.
        if (!atual) return null;

        token.name = atual.nome;
        token.email = atual.email;
        token.role = atual.role;
        token.cargo = atual.cargo;
        token.revalidadoEm = Date.now();
      } catch (err) {
        // Banco fora do ar não pode deslogar a equipe no meio de um evento.
        // Sem carimbar `revalidadoEm`, a próxima requisição tenta de novo.
        console.error("[auth] falha ao revalidar sessão:", err);
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Session["user"]["role"];
      session.user.cargo = (token.cargo ?? null) as string | null;
      return session;
    },
  },
});
