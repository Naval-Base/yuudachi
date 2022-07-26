import RE2 from 're2';

/**
 * @param input `/(hype)\s+(events?|messages?|apply|team|system)/i`
 * @returns `(hype)\s+(events?|messages?|apply|team|system)`
 */
export function parseRegex(input?: string, insensitive = true, fullMatch = false): RE2 | undefined {
	if (!input) return undefined;

	try {
		const regex = /^\/(.+)\/(?:g|m|i|s|u|y)?$/;
		const options = insensitive ? 'i' : '';
		if (regex.test(input)) {
			return new RE2(input.replace(regex, fullMatch ? '^$1$' : '$1'), options);
		}
		return new RE2(input, options);
	} catch {
		return undefined;
	}
}
