import NextAuth, { type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { ZodError } from "zod";
import { signInSchema } from "@/lib/zod";
import { prisma } from "@/lib/prisma";

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
          const { email, password } = await signInSchema.parseAsync(credentials);

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          const ok = await compare(password, user.senhaHash);
          if (!ok) return null;

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
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.cargo = user.cargo;
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
