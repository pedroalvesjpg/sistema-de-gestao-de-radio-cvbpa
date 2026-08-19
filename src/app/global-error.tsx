"use client";

import { useEffect } from "react";

/**
 * Última rede: falha no próprio `app/layout.tsx`, que nenhum `error.tsx`
 * alcança. Substitui o documento inteiro, então precisa de `<html>` e `<body>`
 * próprios — e **não recebe o globals.css**, por isso todo estilo aqui é
 * inline, nas mesmas cores do app (que é light-only).
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[global] erro na raiz:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "4rem 1.5rem",
          textAlign: "center",
          background: "#ffffff",
          color: "#1f2324",
          fontFamily:
            '"Franklin Gothic", "Libre Franklin", ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <title>Erro | RADCOM</title>

        <svg
          viewBox="0 0 100 100"
          width="48"
          height="48"
          aria-hidden="true"
          style={{ display: "block" }}
        >
          <path
            fill="#FF0000"
            d="M35 0 H65 V35 H100 V65 H65 V100 H35 V65 H0 V35 H35 Z"
          />
        </svg>

        <h1
          style={{
            margin: 0,
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          O RADCOM parou de responder
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: "26rem",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            color: "#5b6166",
          }}
        >
          Foi uma falha inesperada, não algo que você fez. Tente de novo; se
          continuar, avise a coordenação informando o código abaixo.
        </p>

        <button
          type="button"
          onClick={() => retry()}
          style={{
            marginTop: "0.5rem",
            cursor: "pointer",
            border: "none",
            borderRadius: "0.625rem",
            background: "#ff0000",
            color: "#ffffff",
            padding: "0.625rem 1.25rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            fontFamily: "inherit",
          }}
        >
          Tentar de novo
        </button>

        {error.digest && (
          <p
            style={{
              margin: 0,
              paddingTop: "0.5rem",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.75rem",
              color: "#8b9095",
            }}
          >
            Código do erro: {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}
