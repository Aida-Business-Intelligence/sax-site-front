import Link from "next/link";
import React, { useMemo } from "react";

/** True se for URL absoluta (http/https) ou WhatsApp (wa.me). Links internos como /contato usam Link. */
function isExternalHref(href: string): boolean {
  const t = href.trim();
  return t.startsWith("http://") || t.startsWith("https://") || t.startsWith("//") || t.includes("wa.me");
}

function ButtonLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  const isExternal = isExternalHref(href);
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return <Link href={href} className={className}>{children}</Link>;
}

const DEFAULT_ABOUT = {
  headerSubtitle: "A história de sucesso da",
  headerTitle: "SAX Negócios Imobiliários",
  headerDescription:
    "Sempre gerando novas oportunidades de investimentos e criando laços significativos com nossos clientes e amigos. Ajudamos você a encontrar a melhor oportunidade de compra e investimento na região, com um conhecimento adquirido de décadas no mercado.",
  teamTitle: "Uma equipe especializada em garantir o seu melhor investimento",
  teamDescription:
    "Queremos te oferecer uma experiência diferenciada de consultoria imobiliária. Estamos no Riviera Business & Mall (sala 711) — você é nosso convidado para tomar um café com vista para a Praia Brava.",
  teamButton1Text: "Fale com nossos corretores",
  teamButton1Href: "/contato",
  teamButton2Text: "Procurar imóveis agora",
  teamButton2Href: "/imoveis",
  missionTitle: "Missão",
  missionText:
    "Satisfazer as expectativas dos nossos clientes para realizar o sonho de investir e morar na melhor região do Brasil, com atendimento humanizado, profundidade de mercado e integração de serviços.",
  visionTitle: "Visão",
  visionText:
    "Ser reconhecida por grandes negócios imobiliários, trazendo investimentos excelentes e de qualidade, sempre acompanhando as tendências do mercado.",
  valuesTitle: "Valores",
  valuesList: [
    "Comprometimento",
    "Facilitação nos processos de compra e venda",
    "Inovação",
    "Qualidade em atendimentos",
    "Excelência nos negócios",
    "Prosperidade",
    "Oportunidade",
    "Integração de serviços",
  ],
  ctaTitle: "Precisando de ajuda?",
  ctaDescription: "Estamos à disposição para garantir o seu melhor investimento.",
  ctaButton1Text: "Fale com nossos corretores",
  ctaButton1Href: "/contato",
  ctaButton2Text: "Explore nossos imóveis",
  ctaButton2Href: "/imoveis",
};

type AboutContent = Record<string, unknown>;

function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function arr(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback;
  return v.filter((item): item is string => typeof item === "string");
}

function normalizeAbout(raw: AboutContent | null | undefined): typeof DEFAULT_ABOUT {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_ABOUT };
  return {
    headerSubtitle: str(raw.headerSubtitle, DEFAULT_ABOUT.headerSubtitle),
    headerTitle: str(raw.headerTitle, DEFAULT_ABOUT.headerTitle),
    headerDescription: str(raw.headerDescription, DEFAULT_ABOUT.headerDescription),
    teamTitle: str(raw.teamTitle, DEFAULT_ABOUT.teamTitle),
    teamDescription: str(raw.teamDescription, DEFAULT_ABOUT.teamDescription),
    teamButton1Text: str(raw.teamButton1Text, DEFAULT_ABOUT.teamButton1Text),
    teamButton1Href: str(raw.teamButton1Href, DEFAULT_ABOUT.teamButton1Href),
    teamButton2Text: str(raw.teamButton2Text, DEFAULT_ABOUT.teamButton2Text),
    teamButton2Href: str(raw.teamButton2Href, DEFAULT_ABOUT.teamButton2Href),
    missionTitle: str(raw.missionTitle, DEFAULT_ABOUT.missionTitle),
    missionText: str(raw.missionText, DEFAULT_ABOUT.missionText),
    visionTitle: str(raw.visionTitle, DEFAULT_ABOUT.visionTitle),
    visionText: str(raw.visionText, DEFAULT_ABOUT.visionText),
    valuesTitle: str(raw.valuesTitle, DEFAULT_ABOUT.valuesTitle),
    valuesList: arr(raw.valuesList, DEFAULT_ABOUT.valuesList),
    ctaTitle: str(raw.ctaTitle, DEFAULT_ABOUT.ctaTitle),
    ctaDescription: str(raw.ctaDescription, DEFAULT_ABOUT.ctaDescription),
    ctaButton1Text: str(raw.ctaButton1Text, DEFAULT_ABOUT.ctaButton1Text),
    ctaButton1Href: str(raw.ctaButton1Href, DEFAULT_ABOUT.ctaButton1Href),
    ctaButton2Text: str(raw.ctaButton2Text, DEFAULT_ABOUT.ctaButton2Text),
    ctaButton2Href: str(raw.ctaButton2Href, DEFAULT_ABOUT.ctaButton2Href),
  };
}

type AboutViewProps = {
  aboutContent?: AboutContent | Record<string, unknown> | null;
};

export function AboutView({ aboutContent = null }: AboutViewProps) {
  const a = useMemo(() => normalizeAbout(aboutContent as AboutContent), [aboutContent]);

  return (
    <div className="w-full">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{a.headerSubtitle}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{a.headerTitle}</h1>
        <p className="mt-3 max-w-3xl text-zinc-700 dark:text-zinc-300">{a.headerDescription}</p>
      </header>

      <section className="rounded-2xl border p-6">
        <h2 className="text-xl font-semibold tracking-tight">{a.teamTitle}</h2>
        <p className="mt-2 max-w-4xl text-sm text-zinc-700 dark:text-zinc-300">{a.teamDescription}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink
            href={a.teamButton1Href}
            className="inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            {a.teamButton1Text}
          </ButtonLink>
          <ButtonLink
            href={a.teamButton2Href}
            className="inline-flex rounded-md border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            {a.teamButton2Text}
          </ButtonLink>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border p-6">
          <h3 className="text-lg font-semibold">{a.missionTitle}</h3>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{a.missionText}</p>
        </div>
        <div className="rounded-2xl border p-6">
          <h3 className="text-lg font-semibold">{a.visionTitle}</h3>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{a.visionText}</p>
        </div>
        <div className="rounded-2xl border p-6">
          <h3 className="text-lg font-semibold">{a.valuesTitle}</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {a.valuesList.map((v) => (
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
            <h3 className="text-lg font-semibold">{a.ctaTitle}</h3>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{a.ctaDescription}</p>
          </div>
          <div className="flex gap-3">
            <ButtonLink
              href={a.ctaButton1Href}
              className="inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
            >
              {a.ctaButton1Text}
            </ButtonLink>
            <ButtonLink
              href={a.ctaButton2Href}
              className="inline-flex rounded-md border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              {a.ctaButton2Text}
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
