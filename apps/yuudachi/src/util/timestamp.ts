import { ms } from "@naval-base/ms";
import { SnowflakeUtil } from "discord.js";

export function resolveTimestamp(dateString?: string | null | undefined) {
	if (!dateString) {
		return null;
	}

	if (/^\d{17,20}$/.test(dateString)) {
		return SnowflakeUtil.timestampFrom(dateString);
	}

	if (/^\d*$/.test(dateString)) {
		return Number(dateString);
	}

	const parsedDate = Date.parse(dateString);

	if (!Number.isNaN(parsedDate)) {
		return parsedDate;
	}

	const msParse = ms(dateString);

	if (!msParse) {
		return null;
	}

	return Date.now() - msParse;
}
