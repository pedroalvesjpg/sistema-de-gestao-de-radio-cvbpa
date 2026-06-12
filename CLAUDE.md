@AGENTS.md

# Sistema de Controle de Rádios — Cruz Vermelha

Sistema para a equipe de radiocomunicação da Cruz Vermelha controlar o
empréstimo (saída) e a devolução de rádios alugados durante eventos.
É um fluxo de *check-out* / *check-in* de equipamento, com rastreabilidade
de quem ficou responsável e do estado em que o rádio voltou.

## Stack

- **Next.js (App Router) full-stack** — front e back no mesmo app, via
  Route Handlers + Server Actions. Linguagem: **TypeScript**.
- **Prisma 7** como ORM (atenção às quebras vs. v6 — ver seção abaixo).
- **PostgreSQL na nuvem (Supabase)** — banco único compartilhado entre as
  máquinas de casa e trabalho (NÃO usar Postgres local, senão os dados
  divergem entre as máquinas).
- **Storage de arquivos**: Supabase Storage (privado, URLs assinadas)
  pras fotos dos rádios e do RG.
- **Auth.js (NextAuth)** para login + controle de acesso por papel.
  (Auth fica com Auth.js, não com Supabase Auth — Supabase é só DB + Storage.)
- **Monorepo natural**: é um único app Next, um repositório só.

## Modelo de dados

O schema completo está em `prisma/schema.prisma`. Entidades:
`User`, `Evento`, `Registro`, `Devolucao`.

### Decisões de domínio (importantes — não reinterpretar)

- **O rádio NÃO é uma entidade.** A Cruz Vermelha aluga os equipamentos;
  o rádio é apenas digitado no momento do registro, em dois campos:
  `modeloRadio` (ex: "Baofeng UV-82") e `codigoRadio` (ex: "25").
  `codigoRadio` é **string** (pode ter zero à esquerda / ser alfanumérico).
- **A equipe NÃO é uma entidade.** É texto livre (`equipe`), ex:
  "Equipe do Vice Presidente Abel". Serve como pista de rastreabilidade
  para um humano, não como identificador nem dimensão de relatório —
  por isso texto livre é proposital (mostrar exatamente como foi digitado).
- **Responsável vs. usuário do sistema** (não confundir):
  - `nomeResponsavel` / `devolvidoPor` = pessoa em campo, no evento.
    Texto livre (pode não ter conta no sistema).
  - `criadoPor` = FK para `User`, o usuário logado que registrou a ação.
    Existe para auditoria ("quem fez o registro/devolução errado").
- **Saída e devolução são tabelas separadas, relação 1:1.** `Registro`
  é a saída; `Devolucao` é o check-in (FK única `registroId`). A devolução
  é um sub-evento com dados próprios (foto, avaria), não um simples flag.
  "Está devolvido?" = a `Devolucao` existe (não há campo de status).
- **Quem devolve pode ser outra pessoa.** Por padrão é o mesmo responsável
  do registro; se for outra pessoa, o campo `devolvidoPor` (string opcional)
  guarda o nome. `null` = mesmo responsável. A checkbox "foi devolvido por
  outra pessoa?" é só controle de UI no front; a regra mora no dado.
- **File na requisição ≠ o que vai no banco.** O upload (`File`) vai pro
  Supabase Storage; no banco guarda-se a **URL** (`urlFotoRg`,
  `urlFotoRadioSaida`, `urlFotoRadioDevolucao`). Requisição com arquivo é
  `multipart/form-data`.

### Papéis e permissões

- `role` (enum `COMUM` | `ADMIN`) controla **permissão** — o que a pessoa
  PODE fazer. Coordenador/diretor/auxiliar caem todos em `ADMIN`.
- `cargo` (string opcional) é **só exibição** ("Diretor(a)", "Coordenador").
  Nenhuma regra depende dele. No front, usar um select com cargos conhecidos
  para manter consistência visual.
- **ADMIN**: gerencia tabela de usuários (criar, deletar, promover/rebaixar),
  gerencia eventos (criar/deletar/ver) e vê **eventos passados com detalhes**.
- **COMUM**: dentro de um evento, vê a tabela de rádios; pode vincular rádio
  a uma equipe, marcar devolução, e desvincular em caso de erro. Só enxerga
  **eventos atuais** (não vê o histórico detalhado de eventos passados).
- Evento tem `dataInicio` e `dataFim` (eventos podem durar dias, ex: Círio).
  A regra passado/atual/futuro deriva dessas datas.

## Prisma 7 — quebras importantes vs. v6 (não reverter sem checar)

- `generator client` usa `provider = "prisma-client"` (sem o sufixo `-js`).
- O `url` **não fica mais no `datasource db`** do schema. Mora só em
  `prisma.config.ts`, no campo `datasource.url`.
- A URL no `prisma.config.ts` serve tanto pro `prisma migrate` quanto pro
  Prisma Client em runtime — não há mais `directUrl`.
- Importar o client de `src/generated/prisma/client`, **não** de
  `@prisma/client`. (O path exato sai do `output` do generator.)
- Sem `@prisma/extension-accelerate`, sem `--no-engine` em `prisma generate`,
  sem `engine` em `defineConfig`. Tudo isso quebra em v7.
- Requer Node ≥ 20.19 e TypeScript ≥ 5.4.

## Comandos

```bash
npm run dev            # roda em localhost:3000 (Turbopack)
npx prisma migrate dev # cria/aplica migrations a partir do schema
npx prisma studio      # UI visual pra ver/editar as tabelas
npx prisma generate    # regenera o client (sai em src/generated/prisma)
```

### Em cada máquina (casa / trabalho)

`git clone`, `npm install`, e recriar o `.env` (não vai pro Git) com a
**mesma** `DATABASE_URL` do Supabase. Não rodar migration de novo — o banco
é o mesmo. Só `npm run dev`.

> Gotcha Supabase + Prisma: a **direct connection**
> (`db.[PROJECT-REF].supabase.co`) resolve **só em IPv6** no plano free;
> em rede sem IPv6 dá `P1001`. Usamos a **Session pooler** do Supavisor
> (`aws-1-[REGION].pooler.supabase.com:5432`) — tem IPv4 e funciona pra
> `prisma migrate`. **Não usar o Transaction pooler** (porta 6543) pra
> migrate: quebra prepared statements. Pra runtime de produção depois,
> o Transaction pooler com `?pgbouncer=true` é a opção performática.

## Convenções

- Nomes de campos/modelos em **português** (facilitar manutenção por outros).
- Storage privado (URLs assinadas), nunca público — há RG e fotos de pessoas.
- **LGPD**: dados pessoais (documento de identificação, fotos). Definir com
  a coordenação por quanto tempo guardar os registros.

## Pendências / próximos passos

- [x] Criar projeto no Supabase e preencher `DATABASE_URL` no `.env`.
- [x] Rodar primeira migration (`npx prisma migrate dev --name init`).
- [ ] Criar helper de Prisma Client (`src/lib/prisma.ts`) com singleton.
- [ ] Configurar Auth.js (provider e estratégia de sessão).
- [ ] Configurar Supabase Storage (bucket privado, URLs assinadas).
- [ ] Definir política de retenção de dados (LGPD).
