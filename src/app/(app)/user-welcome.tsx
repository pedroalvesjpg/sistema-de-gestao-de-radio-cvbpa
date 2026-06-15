export function UserWelcome({ userName }: { userName: string }) {
  const primeiroNome = userName.trim().split(/\s+/)[0] ?? userName;
  return (
    <div className="border-b border-border pb-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Olá, {primeiroNome}.
      </h1>
    </div>
  );
}
