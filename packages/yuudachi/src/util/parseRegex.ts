import RE2 from 're2';

/**
 * @param input - `/(hype)\s+(events?|messages?|apply|team|system)/i`
 * @returns `(hype)\s+(events?|messages?|apply|team|system)`
 */
export function parseRegex(input?: string | null | undefined, insensitive = true, fullMatch = false) {
	if (!input) {
		return null;
	}

	try {
		const regex = /^\/(.+)\/[gimsuy]?$/;
		const options = insensitive ? 'i' : '';

		if (regex.test(input)) {
			return new RE2(input.replace(regex, fullMatch ? '^$1$' : '$1'), options);
		}

		return new RE2(fullMatch ? `^${input}$` : input, options);
	} catch {
		return null;
	}
}
