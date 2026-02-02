import Link from "next/link";
import React from "react";

export function AboutView() {
  return (
    <div className="w-full">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          A história de sucesso da
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          SAX Negócios Imobiliários
        </h1>
        <p className="mt-3 max-w-3xl text-zinc-700 dark:text-zinc-300">
          Sempre gerando novas oportunidades de investimentos e criando laços
          significativos com nossos clientes e amigos. Ajudamos você a encontrar
          a melhor oportunidade de compra e investimento na região, com um
          conhecimento adquirido de décadas no mercado.
        </p>
      </header>

      <section className="rounded-2xl border p-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Uma equipe especializada em garantir o seu melhor investimento
        </h2>
        <p className="mt-2 max-w-4xl text-sm text-zinc-700 dark:text-zinc-300">
          Queremos te oferecer uma experiência diferenciada de consultoria
          imobiliária. Estamos no Riviera Business &amp; Mall (sala 711) —
          você é nosso convidado para tomar um café com vista para a Praia Brava.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/contato"
            className="inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            Fale com nossos corretores
          </Link>
          <Link
            href="/imoveis"
            className="inline-flex rounded-md border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Procurar imóveis agora
          </Link>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border p-6">
          <h3 className="text-lg font-semibold">Missão</h3>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            Satisfazer as expectativas dos nossos clientes para realizar o sonho
            de investir e morar na melhor região do Brasil, com atendimento
            humanizado, profundidade de mercado e integração de serviços.
          </p>
        </div>
        <div className="rounded-2xl border p-6">
          <h3 className="text-lg font-semibold">Visão</h3>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            Ser reconhecida por grandes negócios imobiliários, trazendo
            investimentos excelentes e de qualidade, sempre acompanhando as
            tendências do mercado.
          </p>
        </div>
        <div className="rounded-2xl border p-6">
          <h3 className="text-lg font-semibold">Valores</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {[
              "Comprometimento",
              "Facilitação nos processos de compra e venda",
              "Inovação",
              "Qualidade em atendimentos",
              "Excelência nos negócios",
              "Prosperidade",
              "Oportunidade",
              "Integração de serviços",
            ].map((v) => (
              <li key={v} className="flex items-start gap-2">
                <span className="mt-[2px] text-[#19F5CC]">✔</span>
                <span className="text-zinc-700 dark:text-zinc-300">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold">Precisando de ajuda?</h3>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              Estamos à disposição para garantir o seu melhor investimento.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/contato"
              className="inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
            >
              Fale com nossos corretores
            </Link>
            <Link
              href="/imoveis"
              className="inline-flex rounded-md border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              Explore nossos imóveis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


