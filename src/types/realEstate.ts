export type City = {
	slug: string;
	name: string;
	state: string;
	description?: string;
};

export type Neighborhood = {
	slug: string;
	name: string;
	citySlug: string;
	description?: string;
};

export type Address = {
	street?: string;
	number?: string;
	neighborhood: string;
	city: string;
	state: string;
	zip?: string;
	lat?: number;
	lng?: number;
};

export type Media = {
	url: string;
	alt: string;
	width?: number;
	height?: number;
};

export type Property = {
	id: string;
	slug: string;
	title: string;
	description: string;
	price: number;
	bedrooms: number;
	bathrooms: number;
	area: number; // m²
	type: "casa" | "apartamento" | "terreno" | "comercial";
	/**
	 * Nome da construtora responsável (quando aplicável).
	 * Opcional para manter compatibilidade com mocks existentes.
	 */
	builder?: string;
	address: Address;
	coverImage: Media;
	images?: Media[];
	amenities?: string[];
	createdAt?: string;
	updatedAt?: string;
	// Campos de detalhe (página do imóvel / API by-slug)
	ref?: string | null;
	priceVenda?: number | null;
	priceAluguel?: number | null;
	priceCrowdfunding?: number | null;
	transactionTypes?: string[];
	suites?: number | null;
	demiSuites?: number | null;
	garage?: number | null;
	comodidades?: string[];
	mobiliado?: boolean;
	aceita_pets?: boolean;
	aceita_permuta?: boolean;
	em_construcao?: boolean;
	parceria?: boolean;
	dataPrevistaEntrega?: string | null;
	tagImovel?: string[];
};


