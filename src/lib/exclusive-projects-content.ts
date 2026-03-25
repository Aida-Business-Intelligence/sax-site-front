/**
 * Conteúdo da página /projetos-exclusivos (JSON em SiteConfig.exclusiveProjectsContent).
 */

import { getSaxApiBase } from "./sax-api";

export type ExclusiveProjectsContent = {
  header: { title: string; subtitle: string };
  services: {
    sectionTitle: string;
    items: { title: string; desc: string }[];
  };
  partners: {
    sectionTitle: string;
    sectionSubtitle: string;
    ctaLabel: string;
    items: { name: string; imageUrl: string }[];
  };
  process: {
    sectionTitle: string;
    steps: { stageLabel: string; title: string; desc: string }[];
  };
  tech: {
    logoUrl: string;
    logoAlt: string;
    paragraph1: string;
    paragraph2: string;
    listLeft: string[];
    listRight: string[];
    ctaLabel: string;
    features: { icon: string; title: string; desc: string }[];
  };
  showcase: {
    kicker: string;
    title: string;
    subtitle: string;
    bullets: string[];
    galleryUrls: string[];
  };
  bottomCta: {
    title: string;
    subtitle: string;
    buttonLabel: string;
  };
};

/** URL absoluta para next/image (uploads da API ou caminho local). */
export function resolveExclusiveProjectImageUrl(path: string): string {
  const s = String(path ?? "").trim();
  if (!s) return s;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  // Arquivos em `public/` do sax-site (ex.: /assets/...) — não prefixar com a API
  if (s.startsWith("/assets/")) return s;
  const base = getSaxApiBase();
  return base ? `${base}${s.startsWith("/") ? s : `/${s}`}` : s;
}

export const DEFAULT_EXCLUSIVE_PROJECTS_CONTENT: ExclusiveProjectsContent = {
  header: {
    title: "Projetos exclusivos",
    subtitle:
      "Projetos completos feitos para você. Em parceria com arquitetos e integradores de tecnologia, entregamos ambientes com qualidade, tecnologia e uma experiência de ponta a ponta.",
  },
  services: {
    sectionTitle: "O que fazemos?",
    items: [
      {
        title: "Reforma de Interiores",
        desc: "Projetos completos de interiores, do conceito ao detalhamento e execução.",
      },
      {
        title: "Apartamento Modelo",
        desc: "Planejamento e ambientação do apartamento modelo para acelerar vendas.",
      },
      {
        title: "Projetos de Automação",
        desc: "Soluções de automação, áudio e vídeo integradas para residências e empreendimentos.",
      },
      {
        title: "Levantamentos Gerais",
        desc: "Levantamento métrico e fotográfico para basear decisões e especificações.",
      },
      {
        title: "Detalhamentos",
        desc: "Detalhamento técnico de todos os ambientes, após a aprovação do projeto.",
      },
      {
        title: "Visualizações 3D",
        desc: "Imagens 3D para melhor compreensão do cliente e aprovação das soluções.",
      },
    ],
  },
  partners: {
    sectionTitle: "Parceiros",
    sectionSubtitle: "Trabalhamos com empresas de referência no mercado.",
    ctaLabel: "Fale com nosso arquiteto",
    items: [
      { name: "Drië Arquitetos", imageUrl: "/assets/logo/logo1.png" },
      { name: "Technova Automação", imageUrl: "/assets/logo/logo2.png" },
      { name: "Parceiro Imobiliário", imageUrl: "/assets/logo/logo3.png" },
      { name: "Construtora A", imageUrl: "/assets/logo/logo1.png" },
      { name: "Construtora B", imageUrl: "/assets/logo/logo2.png" },
      { name: "Integrador C", imageUrl: "/assets/logo/logo3.png" },
    ],
  },
  process: {
    sectionTitle: "Como funciona",
    steps: [
      {
        stageLabel: "Etapa 1",
        title: "Briefing",
        desc: "Diretrizes do projeto em conjunto com o cliente ou construtora.",
      },
      {
        stageLabel: "Etapa 2",
        title: "Projeto",
        desc: "Desenvolvimento, detalhamento e definição de soluções de interiores e automação.",
      },
      {
        stageLabel: "Etapa 3",
        title: "Execução",
        desc: "Acompanhamento da obra, instalação e ajustes finais até a entrega.",
      },
    ],
  },
  tech: {
    logoUrl: "/assets/logo/logo2.png",
    logoAlt: "Technova Automação",
    paragraph1:
      "Desde a especificação de um projeto até os ajustes finais do sistema, possuímos expertise técnica e prática em todas as etapas necessárias para o desenvolvimento de projetos de sonorização e controle pelas mais diversas formas, a fim de facilitar o seu dia a dia.",
    paragraph2:
      "Além do conhecimento específico, nossos serviços de consultoria e soluções alinham os objetivos da sua organização com a facilidade de uso. Isso resulta em uma combinação sob medida para sua residência ou corporação.",
    listLeft: [
      "Controle de piscina e Irrigação",
      "Rede e Wifi",
      "Persianas e Cortinas",
      "CFTV",
      "Climatização",
    ],
    listRight: [
      "Controle através de cenas",
      "Controle de iluminação",
      "Distribuição de sinal de vídeo",
      "Controle de áudio e vídeo",
    ],
    ctaLabel: "Fale agora mesmo com nosso arquiteto",
    features: [
      {
        icon: "🛠️",
        title: "Projetos Detalhados",
        desc: "Elaboramos e executamos todo o projeto de automação de forma personalizada.",
      },
      {
        icon: "📱",
        title: "Automação",
        desc: "Integramos o que há de mais moderno em controle de iluminação, clima, áudio e vídeo, cortinas motorizadas e CFTV.",
      },
      {
        icon: "🎬",
        title: "Home Theater e Cinema",
        desc: "Sistemas profissionais de áudio e vídeo que proporcionam qualidade de cinema com o conforto do seu lar.",
      },
    ],
  },
  showcase: {
    kicker: "Final",
    title: "JUST GO IN!",
    subtitle: "Resultado final e entrega das chaves.",
    bullets: [
      "Forros de gesso",
      "Pinturas e texturas",
      "Móveis planejados",
      "Assentamento de revestimentos e pisos",
      "Mármores e granitos",
      "Iluminação",
      "Mobiliários móveis e decoração",
      "Eletrodomésticos",
    ],
    galleryUrls: [
      "/assets/images/home/bc1.png",
      "/assets/images/home/bc1.png",
      "/assets/images/home/bc1.png",
      "/assets/images/home/bc1.png",
      "/assets/images/home/bc1.png",
      "/assets/images/home/bc1.png",
    ],
  },
  bottomCta: {
    title: "Quer acelerar seu projeto?",
    subtitle: "Fale com nossa equipe para um diagnóstico rápido e sem custo.",
    buttonLabel: "Falar com a SAX",
  },
};

function isObj(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function normalizeExclusiveProjectsContent(raw: unknown): ExclusiveProjectsContent {
  const d = DEFAULT_EXCLUSIVE_PROJECTS_CONTENT;
  if (!isObj(raw)) {
    return JSON.parse(JSON.stringify(d)) as ExclusiveProjectsContent;
  }

  const header = isObj(raw.header)
    ? {
        title: typeof raw.header.title === "string" ? raw.header.title : d.header.title,
        subtitle: typeof raw.header.subtitle === "string" ? raw.header.subtitle : d.header.subtitle,
      }
    : d.header;

  const serv = isObj(raw.services) ? raw.services : {};
  const serviceItems = Array.isArray(serv.items)
    ? serv.items
        .filter((x): x is Record<string, unknown> => isObj(x))
        .map((x) => ({
          title: typeof x.title === "string" ? x.title : "",
          desc: typeof x.desc === "string" ? x.desc : "",
        }))
        .filter((x) => x.title.length > 0)
    : d.services.items;
  const services = {
    sectionTitle:
      typeof serv.sectionTitle === "string" ? serv.sectionTitle : d.services.sectionTitle,
    items: serviceItems.length > 0 ? serviceItems : d.services.items,
  };

  const part = isObj(raw.partners) ? raw.partners : {};
  const partnerItems = Array.isArray(part.items)
    ? part.items
        .filter((x): x is Record<string, unknown> => isObj(x))
        .map((x) => ({
          name: typeof x.name === "string" ? x.name : "",
          imageUrl: typeof x.imageUrl === "string" ? x.imageUrl : "",
        }))
        .filter((x) => x.name.length > 0 && x.imageUrl.length > 0)
    : d.partners.items;
  const partners = {
    sectionTitle:
      typeof part.sectionTitle === "string" ? part.sectionTitle : d.partners.sectionTitle,
    sectionSubtitle:
      typeof part.sectionSubtitle === "string"
        ? part.sectionSubtitle
        : d.partners.sectionSubtitle,
    ctaLabel: typeof part.ctaLabel === "string" ? part.ctaLabel : d.partners.ctaLabel,
    items: partnerItems.length > 0 ? partnerItems : d.partners.items,
  };

  const proc = isObj(raw.process) ? raw.process : {};
  const steps = Array.isArray(proc.steps)
    ? proc.steps
        .filter((x): x is Record<string, unknown> => isObj(x))
        .map((x) => ({
          stageLabel: typeof x.stageLabel === "string" ? x.stageLabel : "",
          title: typeof x.title === "string" ? x.title : "",
          desc: typeof x.desc === "string" ? x.desc : "",
        }))
        .filter((x) => x.title.length > 0)
    : d.process.steps;
  const process = {
    sectionTitle:
      typeof proc.sectionTitle === "string" ? proc.sectionTitle : d.process.sectionTitle,
    steps: steps.length > 0 ? steps : d.process.steps,
  };

  const t = isObj(raw.tech) ? raw.tech : {};
  const features = Array.isArray(t.features)
    ? t.features
        .filter((x): x is Record<string, unknown> => isObj(x))
        .map((x) => ({
          icon: typeof x.icon === "string" ? x.icon : "•",
          title: typeof x.title === "string" ? x.title : "",
          desc: typeof x.desc === "string" ? x.desc : "",
        }))
        .filter((x) => x.title.length > 0)
    : d.tech.features;
  const listLeft = Array.isArray(t.listLeft)
    ? t.listLeft.filter((x): x is string => typeof x === "string")
    : d.tech.listLeft;
  const listRight = Array.isArray(t.listRight)
    ? t.listRight.filter((x): x is string => typeof x === "string")
    : d.tech.listRight;
  const tech = {
    logoUrl: typeof t.logoUrl === "string" ? t.logoUrl : d.tech.logoUrl,
    logoAlt: typeof t.logoAlt === "string" ? t.logoAlt : d.tech.logoAlt,
    paragraph1: typeof t.paragraph1 === "string" ? t.paragraph1 : d.tech.paragraph1,
    paragraph2: typeof t.paragraph2 === "string" ? t.paragraph2 : d.tech.paragraph2,
    listLeft: listLeft.length > 0 ? listLeft : d.tech.listLeft,
    listRight: listRight.length > 0 ? listRight : d.tech.listRight,
    ctaLabel: typeof t.ctaLabel === "string" ? t.ctaLabel : d.tech.ctaLabel,
    features: features.length > 0 ? features : d.tech.features,
  };

  const sh = isObj(raw.showcase) ? raw.showcase : {};
  const bullets = Array.isArray(sh.bullets)
    ? sh.bullets.filter((x): x is string => typeof x === "string")
    : d.showcase.bullets;
  const galleryUrls = Array.isArray(sh.galleryUrls)
    ? sh.galleryUrls.filter((x): x is string => typeof x === "string" && x.length > 0)
    : d.showcase.galleryUrls;
  const showcase = {
    kicker: typeof sh.kicker === "string" ? sh.kicker : d.showcase.kicker,
    title: typeof sh.title === "string" ? sh.title : d.showcase.title,
    subtitle: typeof sh.subtitle === "string" ? sh.subtitle : d.showcase.subtitle,
    bullets: bullets.length > 0 ? bullets : d.showcase.bullets,
    galleryUrls: galleryUrls.length > 0 ? galleryUrls : d.showcase.galleryUrls,
  };

  const bc = isObj(raw.bottomCta) ? raw.bottomCta : {};
  const bottomCta = {
    title: typeof bc.title === "string" ? bc.title : d.bottomCta.title,
    subtitle: typeof bc.subtitle === "string" ? bc.subtitle : d.bottomCta.subtitle,
    buttonLabel:
      typeof bc.buttonLabel === "string" ? bc.buttonLabel : d.bottomCta.buttonLabel,
  };

  return {
    header,
    services,
    partners,
    process,
    tech,
    showcase,
    bottomCta,
  };
}
