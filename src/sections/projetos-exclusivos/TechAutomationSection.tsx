import Image from "next/image";
import Link from "next/link";
import React from "react";

const leftListA = [
  "Controle de piscina e Irrigação",
  "Rede e Wifi",
  "Persianas e Cortinas",
  "CFTV",
  "Climatização",
];

const leftListB = [
  "Controle através de cenas",
  "Controle de iluminação",
  "Distribuição de sinal de vídeo",
  "Controle de áudio e vídeo",
];

export function TechAutomationSection() {
  return (
    <section className="mt-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left: Logo + description + checklist */}
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo/logo2.png"
              alt="Technova Automação"
              width={160}
              height={60}
              className="h-12 w-auto"
            />
          </div>

          <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
            Desde a especificação de um projeto até os ajustes finais do sistema, possuímos
            expertise técnica e prática em todas as etapas necessárias para o desenvolvimento
            de projetos de sonorização e controle pelas mais diversas formas, a fim de facilitar
            o seu dia a dia.
          </p>
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
            Além do conhecimento específico, nossos serviços de consultoria e soluções alinham
            os objetivos da sua organização com a facilidade de uso. Isso resulta em uma combinação
            sob medida para sua residência ou corporação.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ul className="space-y-2 text-sm">
              {leftListA.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-[2px] text-[#19F5CC]">✔</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>
            <ul className="space-y-2 text-sm">
              {leftListB.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-[2px] text-[#19F5CC]">✔</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <Link
              href="/contato"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white shadow hover:bg-emerald-600"
            >
              Fale agora mesmo com nosso arquiteto
            </Link>
          </div>
        </div>

        {/* Right: Feature column */}
        <div className="rounded-2xl border p-8">
          <Feature
            icon="🛠️"
            title="Projetos Detalhados"
            desc="Elaboramos e executamos todo o projeto de automação de forma personalizada."
          />
          <div className="my-6 h-px w-full bg-zinc-200 dark:bg-zinc-800" />
          <Feature
            icon="📱"
            title="Automação"
            desc="Integramos o que há de mais moderno em controle de iluminação, clima, áudio e vídeo, cortinas motorizadas e CFTV."
          />
          <div className="my-6 h-px w-full bg-zinc-200 dark:bg-zinc-800" />
          <Feature
            icon="🎬"
            title="Home Theater e Cinema"
            desc="Sistemas profissionais de áudio e vídeo que proporcionam qualidade de cinema com o conforto do seu lar."
          />
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="grid grid-cols-[32px_1fr] items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-base dark:bg-emerald-900/40">
        <span aria-hidden>{icon}</span>
      </div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
      </div>
    </div>
  );
}


