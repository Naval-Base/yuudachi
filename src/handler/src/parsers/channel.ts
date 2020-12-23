import { Result, ok, err } from 'lexure';

const CHANNEL_ID_REGEXP = /^\d{17,19}$/;
const CHANNEL_MENTION_REGEXP = /^<#(\d{17,19})>$/;

export default function parseChannel(arg: string): Result<string, string> {
	const matches = CHANNEL_MENTION_REGEXP.exec(arg);
	if (matches) return ok(matches[1]);
	if (CHANNEL_ID_REGEXP.test(arg)) return ok(arg);
	return err(arg);
}
