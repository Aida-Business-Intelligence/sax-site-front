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
};


