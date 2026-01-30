export function getMapboxToken(): string | undefined {
	return process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

export const defaultMapStyle = "mapbox://styles/mapbox/streets-v12";


