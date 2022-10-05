import Leven from "fast-levenshtein";

function calcDistance(a: string, b: string) {
	const [lowerA, lowerB] = [a.toLowerCase(), b.toLowerCase()];

	if (lowerA.startsWith(lowerB)) {
		return 0;
	}

	if (lowerA.includes(lowerB)) {
		return 1;
	}

	return Leven.get(lowerA, lowerB);
}

export function findBestMatch(input: string, options: string[]) {
	if (input.length < 3) {
		return options;
	}

	const matches = options
		.map((option) => ({
			option,
			dist: calcDistance(option, input),
		}))
		.filter((match) => match.dist < 3);

	console.log(matches);

	if (matches.length === 0) {
		return [];
	}

	return matches.sort((a, b) => b.dist - a.dist).map((match) => match.option);
}
