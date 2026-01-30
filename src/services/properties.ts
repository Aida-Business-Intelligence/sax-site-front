import { Property, City, Neighborhood } from "@/types/realEstate";

// Mock data for initial scaffolding
const properties: Property[] = [
  {
    id: "1",
    slug: "cobertura-premium-jardins-sp",
    title: "Cobertura Premium nos Jardins",
    description:
      "Cobertura de alto padrão com vista panorâmica, área gourmet e piscina privativa.",
    price: 4500000,
    bedrooms: 4,
    bathrooms: 5,
    area: 380,
    type: "apartamento",
    address: {
      neighborhood: "Jardins",
      city: "São Paulo",
      state: "SP",
      lat: -23.564,
      lng: -46.651,
    },
    coverImage: {
      url: "/images/mock/property-1.jpg",
      alt: "Cobertura nos Jardins",
      width: 1200,
      height: 800,
    },
    amenities: ["Piscina", "Área gourmet", "Academia", "Portaria 24h"],
  },
  {
    id: "2",
    slug: "casa-contemporanea-florianopolis",
    title: "Casa Contemporânea em Florianópolis",
    description:
      "Casa ampla e iluminada, integrada à natureza, próxima às melhores praias.",
    price: 3200000,
    bedrooms: 3,
    bathrooms: 4,
    area: 280,
    type: "casa",
    address: {
      neighborhood: "Campeche",
      city: "Florianópolis",
      state: "SC",
      lat: -27.67,
      lng: -48.49,
    },
    coverImage: {
      url: "/images/mock/property-2.jpg",
      alt: "Casa contemporânea em Florianópolis",
      width: 1200,
      height: 800,
    },
    amenities: ["Jardim", "Garagem", "Escritório", "Solarium"],
  },
  {
    id: "3",
    slug: "apartamento-vista-mar-rio",
    title: "Apartamento com Vista para o Mar",
    description:
      "Apartamento moderno em edifício icônico, varanda ampla e vista deslumbrante para a praia.",
    price: 2800000,
    bedrooms: 3,
    bathrooms: 3,
    area: 210,
    type: "apartamento",
    address: {
      neighborhood: "Copacabana",
      city: "Rio de Janeiro",
      state: "RJ",
      lat: -22.971,
      lng: -43.182,
    },
    coverImage: {
      url: "/images/mock/property-3.jpg",
      alt: "Apartamento vista mar no Rio",
      width: 1200,
      height: 800,
    },
    amenities: ["Varanda", "Portaria 24h", "Academia"],
  },
  {
    id: "4",
    slug: "cobertura-belo-horizonte-lourdes",
    title: "Cobertura em Lourdes",
    description:
      "Cobertura elegante em região nobre de BH, com espaço gourmet e jacuzzi.",
    price: 3500000,
    bedrooms: 4,
    bathrooms: 5,
    area: 330,
    type: "apartamento",
    address: {
      neighborhood: "Lourdes",
      city: "Belo Horizonte",
      state: "MG",
      lat: -19.937,
      lng: -43.939,
    },
    coverImage: {
      url: "/images/mock/property-4.jpg",
      alt: "Cobertura em Lourdes, BH",
      width: 1200,
      height: 800,
    },
    amenities: ["Jacuzzi", "Espaço gourmet", "3 vagas"],
  },
  {
    id: "5",
    slug: "casa-contemporanea-curitiba",
    title: "Casa Contemporânea em Curitiba",
    description: "Projeto assinado, ambientes integrados e jardim privativo.",
    price: 2300000,
    bedrooms: 3,
    bathrooms: 4,
    area: 260,
    type: "casa",
    address: {
      neighborhood: "Batel",
      city: "Curitiba",
      state: "PR",
      lat: -25.441,
      lng: -49.276,
    },
    coverImage: {
      url: "/images/mock/property-5.jpg",
      alt: "Casa contemporânea em Curitiba",
      width: 1200,
      height: 800,
    },
    amenities: ["Lareira", "Jardim", "Escritório"],
  },
  {
    id: "6",
    slug: "cobertura-lago-sul-brasilia",
    title: "Cobertura no Lago Sul",
    description:
      "Cobertura com vista para o lago, piscina privativa e acabamentos premium.",
    price: 5200000,
    bedrooms: 4,
    bathrooms: 6,
    area: 420,
    type: "apartamento",
    address: {
      neighborhood: "Lago Sul",
      city: "Brasília",
      state: "DF",
      lat: -15.836,
      lng: -47.882,
    },
    coverImage: {
      url: "/images/mock/property-6.jpg",
      alt: "Cobertura no Lago Sul, Brasília",
      width: 1200,
      height: 800,
    },
    amenities: ["Piscina", "Varanda gourmet", "Vista lago"],
  },
  {
    id: "7",
    slug: "apartamento-recife-boa-viagem",
    title: "Apartamento em Boa Viagem",
    description:
      "Apartamento alto padrão a poucos metros do mar, com lazer completo.",
    price: 1900000,
    bedrooms: 3,
    bathrooms: 3,
    area: 180,
    type: "apartamento",
    address: {
      neighborhood: "Boa Viagem",
      city: "Recife",
      state: "PE",
      lat: -8.119,
      lng: -34.895,
    },
    coverImage: {
      url: "/images/mock/property-7.jpg",
      alt: "Apartamento em Boa Viagem, Recife",
      width: 1200,
      height: 800,
    },
    amenities: ["Piscina", "Salão de festas", "Portaria 24h"],
  },
  {
    id: "8",
    slug: "casa-frente-mar-salvador",
    title: "Casa Frente Mar em Salvador",
    description: "Casa pé na areia com deque, jardim e suíte master com vista.",
    price: 4100000,
    bedrooms: 5,
    bathrooms: 6,
    area: 450,
    type: "casa",
    address: {
      neighborhood: "Itapuã",
      city: "Salvador",
      state: "BA",
      lat: -12.955,
      lng: -38.322,
    },
    coverImage: {
      url: "/images/mock/property-8.jpg",
      alt: "Casa frente mar em Salvador",
      width: 1200,
      height: 800,
    },
    amenities: ["Deck", "Jardim", "Garagem"],
  },
  // Região Costa Norte SC (para testes do mapa por cidade)
  {
    id: "9",
    slug: "apto-frente-mar-bc",
    title: "Apartamento frente mar • BC",
    description:
      "Apartamento com vista para a orla, andar alto e varanda gourmet.",
    price: 3200000,
    bedrooms: 3,
    bathrooms: 3,
    area: 180,
    type: "apartamento",
    builder: "Construtora Atlântica",
    address: {
      neighborhood: "Centro",
      city: "Balneário Camboriú",
      state: "SC",
      lat: -26.9926,
      lng: -48.6357,
    },
    coverImage: {
      url: "/images/mock/property-bc-1.jpg",
      alt: "Apartamento em Balneário Camboriú",
      width: 1200,
      height: 800,
    },
    amenities: ["Varanda gourmet", "Vista mar", "2 vagas"],
  },
  {
    id: "10",
    slug: "cobertura-luxo-bc",
    title: "Cobertura luxo • BC",
    description:
      "Cobertura duplex com terraço amplo, vista 360° e piscina exclusiva.",
    price: 5400000,
    bedrooms: 4,
    bathrooms: 5,
    area: 350,
    type: "apartamento",
    builder: "Grupo Oceano",
    address: {
      neighborhood: "Pioneiros",
      city: "Balneário Camboriú",
      state: "SC",
      lat: -26.975,
      lng: -48.618,
    },
    coverImage: {
      url: "/images/mock/property-bc-2.jpg",
      alt: "Cobertura em Balneário Camboriú",
      width: 1200,
      height: 800,
    },
    amenities: ["Piscina privativa", "Terraço", "3 vagas"],
  },
  {
    id: "11",
    slug: "apto-centro-itajai",
    title: "Apartamento no Centro • Itajaí",
    description:
      "Planta funcional, iluminação natural e fácil acesso às marinas.",
    price: 2100000,
    bedrooms: 3,
    bathrooms: 3,
    area: 160,
    type: "apartamento",
    builder: "Mar Azul Incorporações",
    address: {
      neighborhood: "Centro",
      city: "Itajaí",
      state: "SC",
      lat: -26.9101,
      lng: -48.6705,
    },
    coverImage: {
      url: "/images/mock/property-itajai-1.jpg",
      alt: "Apartamento em Itajaí",
      width: 1200,
      height: 800,
    },
    amenities: ["Varanda", "Academia", "Coworking"],
  },
  {
    id: "12",
    slug: "casa-cond-fechado-itajai",
    title: "Casa em condomínio • Itajaí",
    description:
      "Casa moderna em condomínio, áreas integradas e jardim privativo.",
    price: 2800000,
    bedrooms: 4,
    bathrooms: 5,
    area: 290,
    type: "casa",
    builder: "Mar Azul Incorporações",
    address: {
      neighborhood: "Ressacada",
      city: "Itajaí",
      state: "SC",
      lat: -26.92,
      lng: -48.66,
    },
    coverImage: {
      url: "/images/mock/property-itajai-2.jpg",
      alt: "Casa em Itajaí",
      width: 1200,
      height: 800,
    },
    amenities: ["Jardim", "Espaço gourmet", "Home office"],
  },
  {
    id: "13",
    slug: "apto-vista-mar-itapema",
    title: "Apartamento vista mar • Itapema",
    description:
      "Acabamentos premium, varanda ampla e vista para a Meia Praia.",
    price: 2700000,
    bedrooms: 3,
    bathrooms: 3,
    area: 170,
    type: "apartamento",
    builder: "Prime Towers",
    address: {
      neighborhood: "Meia Praia",
      city: "Itapema",
      state: "SC",
      lat: -27.0904,
      lng: -48.6113,
    },
    coverImage: {
      url: "/images/mock/property-itapema-1.jpg",
      alt: "Apartamento em Itapema",
      width: 1200,
      height: 800,
    },
    amenities: ["Varanda", "Piscina", "2 vagas"],
  },
  {
    id: "14",
    slug: "casa-lazer-itapema",
    title: "Casa de lazer • Itapema",
    description: "Espaços integrados, área gourmet e proximidade da praia.",
    price: 2200000,
    bedrooms: 3,
    bathrooms: 4,
    area: 240,
    type: "casa",
    builder: "Prime Towers",
    address: {
      neighborhood: "Centro",
      city: "Itapema",
      state: "SC",
      lat: -27.095,
      lng: -48.61,
    },
    coverImage: {
      url: "/images/mock/property-itapema-2.jpg",
      alt: "Casa em Itapema",
      width: 1200,
      height: 800,
    },
    amenities: ["Espaço gourmet", "Jardim", "Depósito"],
  },
];

const cities: City[] = [
  {
    slug: "balneario-camboriu-sc",
    name: "Balneário Camboriú",
    state: "SC",
    description: "Arranha-céus, praia central e lifestyle urbano.",
  },
  {
    slug: "itajai-sc",
    name: "Itajaí",
    state: "SC",
    description: "Porto, marinas e crescimento acelerado.",
  },
  {
    slug: "itapema-sc",
    name: "Itapema",
    state: "SC",
    description: "Praias desejadas e empreendimentos de alto padrão.",
  },
];

const neighborhoods: Neighborhood[] = [
  {
    slug: "centro-balneario-camboriu-sc",
    name: "Centro",
    citySlug: "balneario-camboriu-sc",
    description: "Orla e vida urbana.",
  },
  {
    slug: "pioneiros-balneario-camboriu-sc",
    name: "Pioneiros",
    citySlug: "balneario-camboriu-sc",
    description: "Bairro verticalizado no norte.",
  },
  {
    slug: "centro-itajai-sc",
    name: "Centro",
    citySlug: "itajai-sc",
    description: "Região central próxima às marinas.",
  },
  {
    slug: "ressacada-itajai-sc",
    name: "Ressacada",
    citySlug: "itajai-sc",
    description: "Residencial com condomínios.",
  },
  {
    slug: "meia-praia-itapema-sc",
    name: "Meia Praia",
    citySlug: "itapema-sc",
    description: "Bairro com grande verticalização.",
  },
  {
    slug: "centro-itapema-sc",
    name: "Centro",
    citySlug: "itapema-sc",
    description: "Região tradicional e comércio.",
  },
];

export async function getProperties(): Promise<Property[]> {
  return properties;
}

export async function getPropertyBySlug(
  slug: string
): Promise<Property | undefined> {
  return properties.find((p) => p.slug === slug);
}

export async function getCities(): Promise<City[]> {
  return cities;
}

export async function getNeighborhoods(): Promise<Neighborhood[]> {
  return neighborhoods;
}

export function getPropertySlugs(): string[] {
  return properties.map((p) => p.slug);
}

export function getNeighborhoodSlugs(): string[] {
  return neighborhoods.map((n) => n.slug);
}

export function getCitySlugs(): string[] {
  return cities.map((c) => c.slug);
}
