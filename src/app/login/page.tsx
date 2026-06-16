import { LoginForm } from "./login-form";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy p-12 text-navy-foreground lg:flex">
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute -bottom-40 -right-40 h-[760px] w-[760px] opacity-95"
          fill="#FF0000"
          aria-hidden
        >
          <path d="M35 0 H65 V35 H100 V65 H65 V100 H35 V65 H0 V35 H35 Z" />
        </svg>

        <div className="relative z-10 max-w-md space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-white/60">
            Cruz Vermelha Brasileira · RADCOM
          </div>
          <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight">
            Controle de
            <br />
            Rádios.
          </h1>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          © Cruz Vermelha Brasileira
        </p>
      </aside>

      <section className="flex items-center justify-center bg-background px-6 py-12 sm:px-12">
        <LoginForm callbackUrl={callbackUrl} />
      </section>
    </main>
  );
}
