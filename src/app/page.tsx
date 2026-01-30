import Hero from "@/sections/home/Hero";


export const revalidate = 3600; // ISR: 1h

export default async function Home() {
	return (
		<>
			<Hero />
		</>
	);
}
