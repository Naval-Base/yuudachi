import { ms } from '@naval-base/ms';
import { SnowflakeUtil } from 'discord.js';

export function resolveTimestamp(datestring?: string) {
	if (!datestring) {
		return undefined;
	}
	if (Date.parse(datestring)) {
		return Date.parse(datestring);
	}
	if (/^\d{17,20}$/.test(datestring)) {
		return SnowflakeUtil.timestampFrom(datestring);
	}
	if (/^\d*$/.test(datestring)) {
		return Number(datestring);
	}
	const msParse = ms(datestring);
	if (!msParse) {
		return undefined;
	}
	return Date.now() - msParse;
}
