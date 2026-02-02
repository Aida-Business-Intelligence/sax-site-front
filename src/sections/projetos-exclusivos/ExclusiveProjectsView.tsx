import Image from "next/image";
import Link from "next/link";
import React from "react";

import { FinalShowcaseSection } from "./FinalShowcaseSection";
import { TechAutomationSection } from "./TechAutomationSection";

const services = [
  {
    title: "Reforma de Interiores",
    desc:
      "Projetos completos de interiores, do conceito ao detalhamento e execução.",
  },
  {
    title: "Apartamento Modelo",
    desc:
      "Planejamento e ambientação do apartamento modelo para acelerar vendas.",
  },
  {
    title: "Projetos de Automação",
    desc:
      "Soluções de automação, áudio e vídeo integradas para residências e empreendimentos.",
  },
  {
    title: "Levantamentos Gerais",
    desc:
      "Levantamento métrico e fotográfico para basear decisões e especificações.",
  },
  {
    title: "Detalhamentos",
    desc:
      "Detalhamento técnico de todos os ambientes, após a aprovação do projeto.",
  },
  {
    title: "Visualizações 3D",
    desc:
      "Imagens 3D para melhor compreensão do cliente e aprovação das soluções.",
  },
];

const partners = [
  { name: "Drië Arquitetos", src: "/assets/logo/logo1.png" },
  { name: "Technova Automação", src: "/assets/logo/logo2.png" },
  { name: "Parceiro Imobiliário", src: "/assets/logo/logo3.png" },
  { name: "Construtora A", src: "/assets/logo/logo1.png" },
  { name: "Construtora B", src: "/assets/logo/logo2.png" },
  { name: "Integrador C", src: "/assets/logo/logo3.png" },
];

export function ExclusiveProjectsView() {
  return (
    <div className="w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Projetos exclusivos
        </h1>
        <p className="mt-2 max-w-3xl text-zinc-700 dark:text-zinc-300">
          Projetos completos feitos para você. Em parceria com arquitetos e
          integradores de tecnologia, entregamos ambientes com qualidade,
          tecnologia e uma experiência de ponta a ponta.
        </p>
      </header>

      <section aria-labelledby="o-que-fazemos" className="mt-6">
        <h2
          id="o-que-fazemos"
          className="text-xl font-semibold tracking-tight"
        >
          O que fazemos?
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border p-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <h3 className="text-base font-medium">{s.title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="parceiros" className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 id="parceiros" className="text-xl font-semibold tracking-tight">
              Parceiros
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Trabalhamos com empresas de referência no mercado.
            </p>
          </div>
          <Link
            href="/contato"
            className="hidden rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black sm:inline-flex"
          >
            Fale com nosso arquiteto
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {partners.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-center rounded-lg border bg-white p-4 dark:bg-zinc-950"
              title={p.name}
            >
              <Image
                src={p.src}
                alt={p.name}
                width={160}
                height={64}
                className="h-10 w-auto grayscale opacity-80 transition hover:grayscale-0 hover:opacity-100"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/contato"
            className="inline-flex rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            Fale com nosso arquiteto
          </Link>
        </div>
      </section>

      <section aria-labelledby="processo" className="mt-12">
        <h2 id="processo" className="text-xl font-semibold tracking-tight">
          Como funciona
        </h2>
        <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <li className="rounded-xl border p-5">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              Etapa 1
            </div>
            <h3 className="mt-1 text-base font-medium">Briefing</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Diretrizes do projeto em conjunto com o cliente ou construtora.
            </p>
          </li>
          <li className="rounded-xl border p-5">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              Etapa 2
            </div>
            <h3 className="mt-1 text-base font-medium">Projeto</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Desenvolvimento, detalhamento e definição de soluções de
              interiores e automação.
            </p>
          </li>
          <li className="rounded-xl border p-5">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              Etapa 3
            </div>
            <h3 className="mt-1 text-base font-medium">Execução</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Acompanhamento da obra, instalação e ajustes finais até a
              entrega.
            </p>
          </li>
        </ol>
      </section>

      <TechAutomationSection />

      <FinalShowcaseSection />

      <section className="mt-12 rounded-2xl border p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold">Quer acelerar seu projeto?</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Fale com nossa equipe para um diagnóstico rápido e sem custo.
            </p>
          </div>
          <Link
            href="/contato"
            className="inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            Falar com a SAX
          </Link>
        </div>
      </section>
    </div>
  );
}


