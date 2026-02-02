export function getMapboxToken(): string | undefined {
	return process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}

export const defaultMapStyle = "mapbox://styles/mapbox/streets-v12";

// Custom site style (from Mapbox Studio)
// Example style URL: mapbox://styles/{username}/{style_id}
export const siteMapStyle =
	"mapbox://styles/aida-frare/cml5606s1000b01s3awbb00y5";


