import { Logo } from "@/components/brand/logo";
import { LoginForm } from "./login-form";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="grid min-h-svh bg-navy text-navy-foreground lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          aria-hidden="true"
        >
          <div className="absolute -left-10 top-10 h-px w-[140%] rotate-[-22deg] bg-white" />
          <div className="absolute right-0 bottom-32 h-px w-[140%] rotate-[-22deg] bg-white" />
        </div>
        <Logo variant="horizontal" className="relative" />
        <div className="relative max-w-md space-y-3">
          <h1 className="font-[family-name:var(--font-montserrat)] text-4xl font-extrabold leading-tight">
            Controle de Rádios
          </h1>
          <p className="text-base text-white/75">
            Gestão de empréstimo e devolução dos rádios alugados durante
            eventos da Cruz Vermelha Brasileira.
          </p>
        </div>
        <p className="relative text-xs text-white/50">
          © Cruz Vermelha Brasileira
        </p>
      </aside>
      <section className="flex items-center justify-center p-6 lg:bg-background lg:text-foreground">
        <LoginForm callbackUrl={callbackUrl} />
      </section>
    </main>
  );
}
