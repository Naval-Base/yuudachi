/**
 * @param input `/(hype)\s+(events?|messages?|apply|team|system)/i`
 * @returns `(hype)\s+(events?|messages?|apply|team|system)`
 */
export function parseRegex(input: string): string {
	const regex = /^\/(.+)\/(?:g|m|i|s|u|y)?$/;
	if (regex.test(input)) {
		return input.replace(regex, '$1');
	}
	return input;
}
