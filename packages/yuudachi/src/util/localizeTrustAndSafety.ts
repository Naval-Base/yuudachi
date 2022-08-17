import { DiscordLocales, TRUST_AND_SAFETY_URL_BASE } from '../Constants.js';

export function localeTrustAndSafety(locale: string): string {
	// @ts-expect-error
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	return TRUST_AND_SAFETY_URL_BASE.replace('en-us', DiscordLocales[locale] ?? locale);
}
