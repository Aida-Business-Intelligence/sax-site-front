/** Conteúdo CMS da página /para-proprietarios (SiteConfig.proprietariosContent). */

export type ProprietariosCard = { title: string; description: string };

/** Mesmo padrão da Hero (home): WhatsApp (número) ou outra página (URL). */
export type ProprietariosCta = {
  text: string;
  linkType: "whatsapp" | "url";
  link: string;
};

export type ProprietariosPageContent = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  cards: ProprietariosCard[];
  ctaPrimary: ProprietariosCta;
  ctaSecondary: ProprietariosCta;
};

const DEFAULT: ProprietariosPageContent = {
  metaTitle: "Para Proprietários",
  metaDescription:
    "SAX Negócios: avaliação, posicionamento e venda do seu imóvel com estratégia e discrição.",
  title: "Para Proprietários",
  intro:
    "Conte com a SAX para avaliar, posicionar e vender seu imóvel com eficiência e discrição. Unimos dados de mercado, curadoria e relacionamento para maximizar o valor percebido e encurtar o tempo de venda.",
  cards: [
    {
      title: "Avaliação Estratégica",
      description:
        "Estudo de comparativos, liquidez e público-alvo para definir o melhor posicionamento.",
    },
    {
      title: "Divulgação Qualificada",
      description:
        "Materiais profissionais, base ativa de clientes e canais segmentados.",
    },
    {
      title: "Atendimento Consultivo",
      description:
        "Negociação transparente e suporte completo até a escritura.",
    },
    {
      title: "Relatórios e Feedback",
      description:
        "Acompanhamento contínuo de performance e ajustes táticos.",
    },
  ],
  ctaPrimary: {
    text: "Falar com especialista",
    linkType: "url",
    link: "/contato",
  },
  ctaSecondary: {
    text: "Ver imóveis",
    linkType: "url",
    link: "/imoveis",
  },
};

function normalizeCta(
  raw: unknown,
  fallback: ProprietariosCta
): ProprietariosCta {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const o = raw as Record<string, unknown>;
  const text =
    typeof o.text === "string" && o.text.trim()
      ? o.text.trim()
      : fallback.text;

  if (o.linkType === "whatsapp" || o.linkType === "url") {
    const link =
      typeof o.link === "string" && o.link.trim()
        ? o.link.trim()
        : fallback.link;
    return { text, linkType: o.linkType, link };
  }

  // Legado: só `href`
  if (typeof o.href === "string" && o.href.trim()) {
    const href = o.href.trim();
    const digits = href.replace(/\D/g, "");
    if (/wa\.me/i.test(href)) {
      const m = href.match(/wa\.me\/(\d+)/i);
      return {
        text,
        linkType: "whatsapp",
        link: m ? m[1] : digits,
      };
    }
    if (href.startsWith("/") || href.startsWith("http")) {
      return { text, linkType: "url", link: href };
    }
    if (digits.length >= 10 && digits.length <= 15) {
      return { text, linkType: "whatsapp", link: digits };
    }
    return { text, linkType: "url", link: href };
  }

  return { ...fallback, text };
}

/** Href final para <Link href> ou <a href> (externo). */
export function resolveProprietariosCtaHref(cta: ProprietariosCta): string {
  if (cta.linkType === "whatsapp") {
    const digits = String(cta.link).replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : "#";
  }
  const u = String(cta.link || "").trim();
  if (!u) return "#";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return u;
  return `/${u}`;
}

function isCard(x: unknown): x is ProprietariosCard {
  return (
    x != null &&
    typeof x === "object" &&
    typeof (x as ProprietariosCard).title === "string" &&
    typeof (x as ProprietariosCard).description === "string"
  );
}

export function normalizeProprietariosContent(
  raw: Record<string, unknown> | null | undefined
): ProprietariosPageContent {
  if (!raw || typeof raw !== "object") return { ...DEFAULT };

  const cardsRaw = raw.cards;
  const cards = Array.isArray(cardsRaw)
    ? cardsRaw.filter(isCard).map((c) => ({
        title: c.title.trim(),
        description: c.description.trim(),
      }))
    : DEFAULT.cards;

  return {
    metaTitle:
      typeof raw.metaTitle === "string" && raw.metaTitle.trim()
        ? raw.metaTitle.trim()
        : DEFAULT.metaTitle,
    metaDescription:
      typeof raw.metaDescription === "string" && raw.metaDescription.trim()
        ? raw.metaDescription.trim()
        : DEFAULT.metaDescription,
    title:
      typeof raw.title === "string" && raw.title.trim()
        ? raw.title.trim()
        : DEFAULT.title,
    intro:
      typeof raw.intro === "string" && raw.intro.trim()
        ? raw.intro.trim()
        : DEFAULT.intro,
    cards: cards.length > 0 ? cards : DEFAULT.cards,
    ctaPrimary: normalizeCta(raw.ctaPrimary, DEFAULT.ctaPrimary),
    ctaSecondary: normalizeCta(raw.ctaSecondary, DEFAULT.ctaSecondary),
  };
}

export function getProprietariosSeo(
  raw: Record<string, unknown> | null | undefined
): { title: string; description: string } {
  const c = normalizeProprietariosContent(raw);
  return { title: c.metaTitle, description: c.metaDescription };
}
