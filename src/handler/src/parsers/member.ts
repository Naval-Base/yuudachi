import { Result, ok, err } from 'lexure';

const USER_ID_REGEXP = /^\d{17,19}$/;
const USER_MENTION_REGEXP = /^<@!?(\d{17,19})>$/;

export default function parseMember(arg: string): Result<string, string> {
	const matches = USER_MENTION_REGEXP.exec(arg);
	if (matches) return ok(matches[1]);
	if (USER_ID_REGEXP.test(arg)) return ok(arg);
	return err(arg);
}
