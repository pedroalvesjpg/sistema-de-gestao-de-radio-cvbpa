// Cria um evento de exemplo passado + 1 rádio + 1 recebedor + 1 registro já
// devolvido, pra visualizar como a tela de evento passado renderiza pra ADMIN.
//
// Idempotente — procura pelos identificadores e atualiza se já existir.
//
// Uso: npx tsx scripts/seed-exemplo.ts

import "dotenv/config";
import { prisma } from "@/lib/prisma";

const NOME_EVENTO = "Festival de Verão 2026";
const DATA_INICIO = new Date("2026-01-15T08:00:00-03:00");
const DATA_FIM = new Date("2026-01-18T22:00:00-03:00");

const PATRIMONIO_RADIO = "B07";
const RG_RECEBEDOR = "9876543";

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

  // Evento não tem unique key composta, procuro manualmente.
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

  const radio = await prisma.radio.upsert({
    where: { numeroPatrimonio: PATRIMONIO_RADIO },
    update: {},
    create: {
      numeroPatrimonio: PATRIMONIO_RADIO,
      numeroSerie: "SN-0099887",
      marca: "Baofeng",
      modelo: "UV-82",
      acessorios: "Microfone de lapela, antena extra",
      criadoPorId: admin.id,
    },
  });

  let recebedor = await prisma.recebedor.findFirst({
    where: { rg: RG_RECEBEDOR },
  });
  if (!recebedor) {
    recebedor = await prisma.recebedor.create({
      data: {
        nome: "Carlos Souza",
        rg: RG_RECEBEDOR,
        departamento: "Equipe da Orla",
        cargo: "Voluntário(a)",
        foneContato: "(91) 99999-1234",
        criadoPorId: admin.id,
      },
    });
  }

  let registro = await prisma.registro.findFirst({
    where: { eventoId: evento.id, radioId: radio.id },
    include: { devolucao: true },
  });
  if (!registro) {
    registro = await prisma.registro.create({
      data: {
        eventoId: evento.id,
        radioId: radio.id,
        recebedorId: recebedor.id,
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
  console.log(`  Rádio: ${radio.numeroPatrimonio} (id ${radio.id})`);
  console.log(`  Recebedor: ${recebedor.nome} (id ${recebedor.id})`);
  console.log(`  Registro: id ${registro.id} com devolução`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
