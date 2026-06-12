export function UserWelcome({ userName }: { userName: string }) {
  const primeiroNome = userName.trim().split(/\s+/)[0] ?? userName;
  return (
    <div className="border-l-4 border-primary pl-4">
      <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight">
        Olá, {primeiroNome}!
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Veja os eventos abertos e próximos. Em cada evento, registre as saídas
        de rádios e marque as devoluções.
      </p>
    </div>
  );
}
