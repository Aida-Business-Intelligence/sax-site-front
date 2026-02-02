import { BlogPost } from "@/types/blog";

export const initialBlogPosts: BlogPost[] = [
  {
    id: "p1",
    slug: "como-investir-em-imoveis-em-2026",
    title: "Como investir em imóveis em 2026",
    excerpt:
      "Táticas práticas para construir patrimônio com ativos reais no cenário atual.",
    content:
      "Exploramos estratégias de entrada, análise de risco e retorno, além de como avaliar localização, liquidez e gestão. Abordamos também tendências urbanas e como dados podem apoiar decisões.",
    coverUrl: "/assets/images/home/bc1.png",
    tags: ["investimentos", "mercado-imobiliario"],
    authorName: "Equipe SAX",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    reactions: { likes: 12 },
    comments: [
      {
        id: "c1",
        authorName: "Ana",
        message: "Excelente resumo, ajudou a esclarecer pontos chaves!",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
    ],
  },
  {
    id: "p2",
    slug: "bairro-em-alta-2026",
    title: "Bairros em alta em 2026",
    excerpt:
      "Levantamento dos bairros com maior potencial de valorização neste ano.",
    content:
      "Mapeamos bairros com melhoria de infraestrutura, mobilidade e oferta de serviços. Veja como isso se traduz em demanda e preço por metro quadrado.",
    coverUrl: "/assets/images/home/bc1.png",
    tags: ["tendencias", "bairros"],
    authorName: "Equipe SAX",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    reactions: { likes: 7 },
    comments: [],
  },
];


