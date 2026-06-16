const dataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const data = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function fmtDataHora(d: Date) {
  return dataHora.format(d);
}

export function fmtData(d: Date) {
  return data.format(d);
}

/** Formata uma Date como string `YYYY-MM-DDTHH:MM` em horário LOCAL (input type=datetime-local). */
export function toDatetimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function statusEvento(evento: { dataInicio: Date; dataFim: Date }, now = new Date()) {
  if (now < evento.dataInicio) return "futuro" as const;
  if (now > evento.dataFim) return "passado" as const;
  return "atual" as const;
}

/** Primeiro nome (até o primeiro espaço). Vazio cai para a string original. */
export function primeiroNome(nome: string) {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

/** Iniciais (primeira + última palavra) em maiúsculas. "?" quando vazio. */
export function iniciais(nome?: string | null) {
  if (!nome) return "?";
  const parts = nome.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

