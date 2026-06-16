import { primeiroNome } from "@/lib/format";

export function UserWelcome({ userName }: { userName: string }) {
  return (
    <div className="border-b border-border pb-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Olá, {primeiroNome(userName)}.
      </h1>
    </div>
  );
}
