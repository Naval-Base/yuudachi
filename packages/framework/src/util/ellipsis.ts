export function ellipsis(text: string, total: number) {
	if (text.length <= total) {
		return text;
	}

	const keep = total - 3;

	if (keep < 1) {
		return text.slice(0, total);
	}

	return `${text.slice(0, keep)}...`;
}
