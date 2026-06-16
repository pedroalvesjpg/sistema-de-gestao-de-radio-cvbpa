import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { iniciais } from "@/lib/format";
import { getSignedUrl } from "@/lib/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/brand/logo";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default async function CrachaPage() {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      nome: true,
      cargo: true,
      role: true,
      fotoPerfilUrl: true,
    },
  });
  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        Não conseguimos carregar seus dados.
      </p>
    );
  }

  const fotoUrl = user.fotoPerfilUrl
    ? await getSignedUrl(user.fotoPerfilUrl)
    : null;

  const funcao =
    user.cargo || (user.role === "ADMIN" ? "Administrador" : "Operador");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="border-b border-border pb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Crachá funcional
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex justify-center">
          <div className="flex w-[20rem] flex-col overflow-hidden rounded-md border border-border bg-white shadow-md">
            <div className="flex items-center justify-center gap-3 px-4 pb-3 pt-5">
              <Logo variant="mark" className="h-12 w-12 shrink-0" />
              <div className="font-display text-lg font-black uppercase leading-[0.95] tracking-tight text-foreground">
                Cruz Vermelha
                <br />
                Brasileira
              </div>
            </div>

            <div className="flex justify-center px-6 py-6">
              <Avatar className="h-44 w-44 rounded-sm" size="default">
                {fotoUrl && (
                  <AvatarImage
                    src={fotoUrl}
                    alt={user.nome}
                    className="rounded-sm"
                  />
                )}
                <AvatarFallback className="rounded-md bg-muted text-3xl font-bold text-muted-foreground">
                  {iniciais(user.nome)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="bg-[#C52B29] px-4 py-3 text-center">
              <p className="truncate font-display text-xl font-extrabold uppercase tracking-wide text-white">
                {user.nome}
              </p>
            </div>

            <div className="px-4 pb-6 pt-3 text-center">
              <p className="truncate font-display text-sm font-bold uppercase tracking-wider text-foreground">
                {funcao}
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-border px-4 py-3 text-[10px] text-muted-foreground">
              <span>Órgão Central</span>
              <span className="font-mono tabular-nums">
                CNPJ: 33.651.803/0001-65
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex w-[20rem] flex-col overflow-hidden rounded-md border border-border bg-white shadow-md">
            <div className="flex items-center justify-center gap-3 px-4 pb-3 pt-5">
              <p className="tracking-tight">CRACHÁ FUNCIONAL</p>
            </div>

            <div className="flex flex-col justify-center px-2 gap-2">
              <div className="flex flex-col gap-2">
                <Label className="font-bold text-sm uppercase text-muted-foreground">
                  Nome completo:
                </Label>
                <Input value={user.nome} readOnly />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-bold text-sm uppercase text-muted-foreground">
                  Função:
                </Label>
                <Input value={funcao} readOnly />
              </div>
            </div>

            <div className="flex items-center justify-center px-4 py-1">
              <p className="truncate font-display font-extrabold uppercase tracking-wide">
                COLABORADOR VOLUNTÁRIO
              </p>
            </div>

            <div className="bg-[#5B5D60] py-0.5 text-center">
              <p className="truncate text-[0.75rem] font-extralight text-white">
                VÁLIDO EM TODO TERRITÓRIO NACIONAL
              </p>
            </div>

            <div className="flex flex-col items-center justify-center px-2 py-2">
              <p className="text-[0.6rem] font-extralight tracking-wide">
                UTILIDADE PÚBLICA INTERNACIONAL - Decreto Federal nº 9.620 de
                13/06/1912.
              </p>
              <p className="text-[0.6rem] font-extralight tracking-wide">
                Este documento pertence à CVB, em caso de extravio favor enviar
                para:
              </p>
            </div>

            <div className="bg-[#C52B29] flex flex-col justify-start px-4 py-1">
              <p className="text-[0.75rem] font-bold uppercase tracking-wide text-white">
                CRUZ VERMELHA BRASILEIRA
              </p>
              <p className="text-[0.6rem] font-extralight tracking-wide text-white">
                Praca Cruz Vermelha, 10/12 Centro
              </p>
              <p className="text-[0.6rem] font-extralight tracking-wide text-white">
                CEP 20230-130 - Rio de Janeiro - RJ
              </p>
              <p className="text-[0.6rem] font-extralight tracking-wide text-white">
                Telefones +55 21 2507-3392 e +55 21 2507-3577
              </p>
              <p className="text-[0.6rem] font-extralight tracking-wide text-white">
                www.cruzvermelha.org.br
              </p>
            </div>

            <div className="flex flex-col items-center justify-center px-2 py-2">
              <p className="text-[0.6rem] font-extralight tracking-wide">
                Este crachá é a identificação oficial do colaborador(a) da Cruz
                Vermelha Brasileira, e é de uso pessoal e instransferível.
              </p>
              <p className="text-[0.6rem] font-extralight tracking-wide">
                Este organismo credibiliza ao portador nominal desta credencial
                como pertencente aos quadros orgânicos, bem como solicita às
                autoridades civis e militares que o reconheçam como tal e
                proponham as facilidades que necessite ou solicite em virtude do
                caráter que investe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
