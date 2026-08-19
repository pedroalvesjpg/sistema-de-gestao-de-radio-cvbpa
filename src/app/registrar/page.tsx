import type { Metadata } from "next";
import { SolicitarForm } from "./solicitar-form";

export const metadata: Metadata = {
  title: "Solicitar acesso | RADCOM",
};

export default function RegistrarPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-12 sm:px-12">
      <SolicitarForm />
    </main>
  );
}
