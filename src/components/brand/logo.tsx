import { cn } from "@/lib/utils";

type Variant = "stacked" | "horizontal" | "mark";

interface LogoProps {
  variant?: Variant;
  className?: string;
  /** Esconde texto da label (sr-only fica acessível). Útil em mobile. */
  hideLabel?: boolean;
}

/**
 * Logo da Cruz Vermelha Brasileira.
 * - "mark": só a cruz (uso em ícones pequenos).
 * - "stacked": cruz acima, "CRUZ VERMELHA / BRASILEIRA" abaixo.
 * - "horizontal": cruz à esquerda, texto à direita.
 *
 * Regra do manual de identidade: em digital, usar apenas a versão vermelha
 * sobre fundo branco.
 */
export function Logo({ variant = "horizontal", className, hideLabel }: LogoProps) {
  const cross = (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="block h-full w-full"
    >
      <path
        fill="#FF0000"
        d="M35 0 H65 V35 H100 V65 H65 V100 H35 V65 H0 V35 H35 Z"
      />
    </svg>
  );

  if (variant === "mark") {
    return (
      <span
        aria-label="Cruz Vermelha Brasileira"
        className={cn("inline-block h-8 w-8", className)}
      >
        {cross}
      </span>
    );
  }

  if (variant === "stacked") {
    return (
      <span
        aria-label="Cruz Vermelha Brasileira"
        className={cn("inline-flex flex-col items-center gap-2", className)}
      >
        <span className="h-12 w-12">{cross}</span>
        {!hideLabel && (
          <span className="text-center text-[10px] font-extrabold uppercase tracking-tight leading-tight font-[family-name:var(--font-montserrat)]">
            Cruz Vermelha<br />Brasileira
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      aria-label="Cruz Vermelha Brasileira"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <span className="h-9 w-9 shrink-0">{cross}</span>
      <span
        className={cn(
          "text-[11px] font-extrabold uppercase leading-tight tracking-tight font-[family-name:var(--font-montserrat)]",
          hideLabel && "sr-only",
        )}
      >
        Cruz Vermelha<br />Brasileira
      </span>
    </span>
  );
}
