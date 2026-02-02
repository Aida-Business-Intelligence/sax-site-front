import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import OwnerAuth from "@/sections/proprietarios/OwnerAuth";

export const revalidate = 1800;
export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Para Proprietários",
  canonical: "/para-proprietarios",
  description:
    "SAX Negócios: avaliação, posicionamento e venda do seu imóvel com estratégia e discrição.",
});

export default function ParaProprietariosPage() {
  return (
    <div className="relative min-h-screen pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-[0.03]"
        style={{ backgroundImage: "url('/assets/images/home/bc1.png')" }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-36">
        <div className="grid items-start gap-8 lg:grid-cols-2">
          {/* Lado esquerdo: informações */}
          <div className="max-w-3xl">
            <h1 className="mb-3 text-3xl font-semibold tracking-tight">
              Para Proprietários
            </h1>
            <p className="text-zinc-700 dark:text-zinc-300">
              Conte com a SAX para avaliar, posicionar e vender seu imóvel com
              eficiência e discrição. Unimos dados de mercado, curadoria e
              relacionamento para maximizar o valor percebido e encurtar o tempo
              de venda.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border p-5 dark:border-zinc-800">
                <h3 className="text-base font-medium">Avaliação Estratégica</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Estudo de comparativos, liquidez e público-alvo para definir o
                  melhor posicionamento.
                </p>
              </div>
              <div className="rounded-xl border p-5 dark:border-zinc-800">
                <h3 className="text-base font-medium">Divulgação Qualificada</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Materiais profissionais, base ativa de clientes e canais
                  segmentados.
                </p>
              </div>
              <div className="rounded-xl border p-5 dark:border-zinc-800">
                <h3 className="text-base font-medium">Atendimento Consultivo</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Negociação transparente e suporte completo até a escritura.
                </p>
              </div>
              <div className="rounded-xl border p-5 dark:border-zinc-800">
                <h3 className="text-base font-medium">Relatórios e Feedback</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Acompanhamento contínuo de performance e ajustes táticos.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contato"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Falar com especialista
              </Link>
              <Link
                href="/imoveis"
                className="rounded-md border px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                Ver imóveis
              </Link>
            </div>
          </div>
          {/* Lado direito: login/cadastro */}
          <div className="lg:ml-auto">
            <OwnerAuth />
          </div>
        </div>
      </div>
    </div>
  );
}


