export function truncate(text: string, length: number, splitChar = " ") {
	if (text.length <= length) {
		return text;
	}

	const words = text.split(splitChar);
	const res: string[] = [];
	for (const word of words) {
		const full = res.join(splitChar);

		if (full.length + word.length + 1 <= length - 3) {
			res.push(word);
		}
	}

	const resText = res.join(splitChar);

	return resText.length === text.length ? resText : `${resText.trim()}...`;
}
