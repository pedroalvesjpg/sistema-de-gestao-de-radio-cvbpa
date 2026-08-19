"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fmtDataHora } from "@/lib/format";
import type { Role } from "@/generated/prisma/enums";
import { aprovarSolicitacao, rejeitarSolicitacao } from "./actions";

export type Solicitacao = {
  id: number;
  nome: string;
  email: string;
  cargo: string | null;
  justificativa: string | null;
  criadoEm: Date;
};

export function SolicitacoesList({
  solicitacoes,
}: {
  solicitacoes: Solicitacao[];
}) {
  if (solicitacoes.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-md border border-amber-300/70 bg-amber-50/60">
      <div className="flex items-baseline justify-between gap-4 border-b border-amber-300/70 px-4 py-2.5">
        <span className="text-xs font-bold uppercase tracking-wide text-amber-900">
          Pedidos de acesso aguardando
        </span>
        <span className="font-mono text-xs font-bold tabular-nums text-amber-900">
          {solicitacoes.length}
        </span>
      </div>
      <ul className="divide-y divide-amber-200">
        {solicitacoes.map((s) => (
          <SolicitacaoRow key={s.id} solicitacao={s} />
        ))}
      </ul>
    </section>
  );
}

function SolicitacaoRow({ solicitacao }: { solicitacao: Solicitacao }) {
  const [aprovarAberto, setAprovarAberto] = useState(false);
  const [recusarAberto, setRecusarAberto] = useState(false);

  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-semibold">{solicitacao.nome}</span>
          <span className="text-sm text-muted-foreground">
            {solicitacao.email}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {solicitacao.cargo || "sem cargo informado"} · pedido em{" "}
          <span className="tabular-nums">
            {fmtDataHora(solicitacao.criadoEm)}
          </span>
        </div>
        {solicitacao.justificativa && (
          <p className="max-w-prose text-sm text-foreground/80">
            “{solicitacao.justificativa}”
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRecusarAberto(true)}
        >
          <X />
          Recusar
        </Button>
        <Button type="button" size="sm" onClick={() => setAprovarAberto(true)}>
          <Check />
          Aprovar
        </Button>
      </div>

      <AprovarDialog
        solicitacao={solicitacao}
        open={aprovarAberto}
        onOpenChange={setAprovarAberto}
      />
      <RecusarDialog
        solicitacao={solicitacao}
        open={recusarAberto}
        onOpenChange={setRecusarAberto}
      />
    </li>
  );
}

function AprovarDialog({
  solicitacao,
  open,
  onOpenChange,
}: {
  solicitacao: Solicitacao;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [role, setRole] = useState<Role>("COMUM");
  const [pending, startTransition] = useTransition();

  function confirmar() {
    startTransition(async () => {
      const result = await aprovarSolicitacao(solicitacao.id, role);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(`${solicitacao.nome} agora tem acesso`);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aprovar acesso</DialogTitle>
          <DialogDescription>
            {solicitacao.nome} · {solicitacao.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor={`papel-${solicitacao.id}`}>Papel no sistema</Label>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger id={`papel-${solicitacao.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMUM">Operador</SelectItem>
              <SelectItem value="ADMIN">Administrador</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            A conta é criada com a senha que a própria pessoa cadastrou no
            pedido — ela já consegue entrar.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={confirmar} disabled={pending}>
            {pending ? "Aprovando…" : "Aprovar acesso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecusarDialog({
  solicitacao,
  open,
  onOpenChange,
}: {
  solicitacao: Solicitacao;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [pending, startTransition] = useTransition();

  function confirmar() {
    startTransition(async () => {
      const result = await rejeitarSolicitacao(solicitacao.id, motivo);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Pedido recusado");
      setMotivo("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recusar pedido</DialogTitle>
          <DialogDescription>
            {solicitacao.nome} · {solicitacao.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor={`motivo-${solicitacao.id}`}>
            Motivo (opcional, fica na auditoria)
          </Label>
          <Textarea
            id={`motivo-${solicitacao.id}`}
            rows={2}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex: não faz parte da equipe de radiocomunicação"
          />
          <p className="text-xs text-muted-foreground">
            Nenhuma conta é criada. A pessoa pode enviar um novo pedido depois.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={confirmar}
            disabled={pending}
          >
            {pending ? "Recusando…" : "Recusar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
