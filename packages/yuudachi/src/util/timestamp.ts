import { ms } from '@naval-base/ms';
import { SnowflakeUtil } from 'discord.js';

export function resolveTimestamp(dateString?: string) {
	if (!dateString) {
		return undefined;
	}

	if (Date.parse(dateString)) {
		return Date.parse(dateString);
	}

	if (/^\d{17,20}$/.test(dateString)) {
		return SnowflakeUtil.timestampFrom(dateString);
	}

	if (/^\d*$/.test(dateString)) {
		return Number(dateString);
	}

	const msParse = ms(dateString);
	if (!msParse) {
		return undefined;
	}

	return Date.now() - msParse;
}
