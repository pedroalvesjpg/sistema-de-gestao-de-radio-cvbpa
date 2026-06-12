// Cria um evento de exemplo passado + 1 registro de rádio já devolvido,
// pra visualizar como a tela de evento passado renderiza pra ADMIN.
//
// Idempotente — upsert no nome+período do evento e no par (evento, código).
//
// Uso: npx tsx scripts/seed-exemplo.ts

import "dotenv/config";
import { prisma } from "@/lib/prisma";

const NOME_EVENTO = "Festival de Verão 2026";
const DATA_INICIO = new Date("2026-01-15T08:00:00-03:00");
const DATA_FIM = new Date("2026-01-18T22:00:00-03:00");

const CODIGO_RADIO = "07";

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { id: "asc" },
  });
  if (!admin) {
    console.error(
      "✗ Nenhum usuário ADMIN encontrado. Rode antes:\n" +
        '  npx tsx scripts/create-user.ts <email> <senha> "<nome>" admin',
    );
    process.exit(1);
  }

  // Como Evento não tem unique key composta, procuro manualmente.
  let evento = await prisma.evento.findFirst({
    where: { nome: NOME_EVENTO, dataInicio: DATA_INICIO },
  });
  evento = evento
    ? await prisma.evento.update({
        where: { id: evento.id },
        data: { dataFim: DATA_FIM },
      })
    : await prisma.evento.create({
        data: {
          nome: NOME_EVENTO,
          dataInicio: DATA_INICIO,
          dataFim: DATA_FIM,
          criadoPorId: admin.id,
        },
      });

  let registro = await prisma.registro.findFirst({
    where: { eventoId: evento.id, codigoRadio: CODIGO_RADIO },
    include: { devolucao: true },
  });
  if (!registro) {
    registro = await prisma.registro.create({
      data: {
        eventoId: evento.id,
        modeloRadio: "Baofeng UV-82",
        codigoRadio: CODIGO_RADIO,
        equipe: "Equipe da Orla",
        nomeResponsavel: "Carlos Souza",
        rgResponsavel: "9876543",
        urlFotoRg: "placeholder://rg",
        urlFotoRadioSaida: "placeholder://radio-saida",
        observacao: "Bateria carregada, antena ok.",
        criadoPorId: admin.id,
      },
      include: { devolucao: true },
    });
  }

  if (!registro.devolucao) {
    await prisma.devolucao.create({
      data: {
        registroId: registro.id,
        urlFotoRadioDevolucao: "placeholder://radio-devolucao",
        possuiAvaria: false,
        devolvidoPor: null,
        observacao: "Devolvido sem ocorrências.",
        criadoPorId: admin.id,
      },
    });
  }

  console.log("✓ Seed pronto:");
  console.log(`  Evento: ${evento.nome} (id ${evento.id})`);
  console.log(`  Período: ${DATA_INICIO.toISOString()} → ${DATA_FIM.toISOString()}`);
  console.log(`  Registro: #${CODIGO_RADIO} (id ${registro.id}) com devolução`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
