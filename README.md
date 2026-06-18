<div align="center">

  <img src="src/app/icon.svg" width="72" alt="Cruz Vermelha Brasileira" />

# RADCOM

### Controle de empréstimo e devolução de rádios em eventos da Cruz Vermelha Brasileira

[![Cruz Vermelha](https://img.shields.io/badge/Cruz_Vermelha-Brasileira-FF0000?style=flat-square&labelColor=011E41)](https://www.cvb.org.br/)
[![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Mobile-first](https://img.shields.io/badge/mobile--first-FF0000?style=flat-square)](#)
[![Status](https://img.shields.io/badge/status-em_desenvolvimento-amber?style=flat-square)](#)

[![Next.js](https://img.shields.io/badge/Next.js_16-000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Auth.js](https://img.shields.io/badge/Auth.js_v5-000?style=flat-square&logo=auth0&logoColor=white)](https://authjs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000?style=flat-square&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

<br />

<img src="docs/screenshots/03-evento.png" alt="Tela de detalhe de um evento, listando rádios em campo com avatar do operador" width="900" />

</div>

---

## Sobre

**RADCOM** é o sistema interno de radiocomunicações da Cruz Vermelha
Brasileira Paraense para controlar o empréstimo (saída) e a devolução de rádios
alugados ou do acervo patrimonial da CVBPA durante eventos: Círio, arraiais, mutirões, operações de campo.

É um fluxo de _check-out_ / _check-in_ de equipamento, com prova fotográfica
(RG do recebedor + rádio na entrega) e rastreabilidade de quem ficou
responsável e do estado em que o rádio voltou.

## Funcionalidades

- **Eventos** — criar, editar e acompanhar eventos com `dataInicio` / `dataFim`.
  Status calculado automaticamente: ao vivo, próximo, encerrado.
- **Cadastro reutilizável** — `Rádio` (patrimônio) e `Recebedor` (pessoa em
  campo) são entidades reutilizadas entre eventos.
- **Saída de rádio** — vincula rádio ↔ recebedor ↔ evento. Captura foto do RG
  e do rádio na entrega como prova do ato.
- **Devolução** — tabela separada com relação 1:1. Registra quem devolveu
  (pode ser outra pessoa), avaria, observação e foto.
- **Auditoria imutável** — toda ação sensível vira `AuditLog` que sobrevive
  à deleção do ator (snapshot do nome + FK SetNull).
- **PWA instalável** — manifest, ícones (incl. maskable), splash automático
  via theme color. Roda em tela cheia no celular.
- **Storage privado** — fotos no Storage com URLs assinadas de curta
  expiração (RG e fotos pessoais nunca ficam públicos).
- **Crachá funcional** — geração de crachá com foto e papel pra identificação
  em campo.

## Galeria

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/01-login.png" alt="Tela de login institucional" />
      <p><sub>Login institucional</sub></p>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/02-dashboard.png" alt="Dashboard administrativo com KPIs e lista de eventos" />
      <p><sub>Dashboard com KPIs e eventos</sub></p>
    </td>
  </tr>
</table>

## Stack

| Camada            | Tecnologia                                          |
| ----------------- | --------------------------------------------------- |
| Framework         | Next.js 16 (App Router, Turbopack, RSC)             |
| Linguagem         | TypeScript                                          |
| ORM               | Prisma 7 (provider `prisma-client`)                 |
| Banco             | PostgreSQL via **Supabase**                         |
| Storage           | Supabase Storage (bucket privado, URLs assinadas)   |
| Auth              | **Auth.js v5** (credentials + roles)                |
| UI                | Tailwind CSS v4 + shadcn/ui (Base UI)               |
| Formulários       | React Hook Form + Zod                               |
| Identidade visual | Manual da Cruz Vermelha Brasileira (Libre Franklin) |

## Domínio em uma página

```
Evento ┐
       │ (1:N)
Radio ─┼─→ Registro ──(1:1)──→ Devolucao
       │       │
Recebedor ←────┘
       │
User (criadoPor — auditoria do operador logado)
```

- **Saída/empréstimo = `Registro`.** Liga `Evento × Radio × Recebedor` e
  guarda as provas do ato (`urlFotoRg`, `urlFotoRadioSaida`).
- **Devolução é tabela separada com 1:1**. "Está devolvido?" = a `Devolucao`
  existe. Não há campo de status no `Registro`.

## Identidade visual

Padrão visual segue o **Manual de Identidade Institucional da Cruz Vermelha
Brasileira**: paleta vermelho `#FF0000` + navy `#011E41` + dark `#1f2324` +
cinza `#A7AFB2`, tipografia da família **Franklin Gothic** (Libre Franklin
no Google Fonts), composição sóbria e institucional — não SaaS com cara
de IA.

- **Hairlines** no lugar de sombras
- **Faixa CV 3px vermelha** no topo do shell como assinatura visual
- **Status sem pílulas coloridas**: dot vermelho + `uppercase tracking-wide`
- **Touch generoso**: áreas usadas em campo (`size="lg"` em ações primárias)
- **Mono pra dados técnicos**: JetBrains Mono + `tabular-nums`

## LGPD

O sistema armazena documento de identificação (foto do RG) e fotos pessoais
no Supabase Storage privado, com URLs assinadas de curta expiração. A
política de retenção deve ser definida com a coordenação.

---

<div align="center">
  <sub>Feito para a equipe de radiocomunicação da <strong>Cruz Vermelha Brasileira Paraense</strong>.</sub>
</div>
