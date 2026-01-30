declare module 'autosuggest-highlight/match' {
	export type MatchOptions = {
		insideWords?: boolean;
		findAllOccurrences?: boolean;
	};

	// Returns start/end index tuples for matches within the text.
	export default function match(
		text: string,
		query: string,
		options?: MatchOptions
	): Array<[number, number]>;
}

declare module 'autosuggest-highlight/parse' {
	export type ParsedPart = {
		text: string;
		highlight: boolean;
	};

	// Splits text into highlighted and non-highlighted parts using match tuples.
	export default function parse(
		text: string,
		matches: Array<[number, number]>
	): ParsedPart[];
}


