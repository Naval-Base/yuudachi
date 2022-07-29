import dayjs from 'dayjs';
import { inlineCode, time, TimestampStyles } from 'discord.js';
import { DATE_FORMAT_LOGFILE } from '../../Constants.js';

export enum AntiRaidNukeModes {
	Filter = 'filter',
	Modal = 'modal',
	File = 'file',
}

export function resolveDateLocale(timestamp: number | undefined, discord = true): string {
	return timestamp
		? discord
			? time(dayjs(timestamp).unix(), TimestampStyles.ShortDateTime)
			: dayjs(timestamp).format(DATE_FORMAT_LOGFILE)
		: inlineCode('Not specified');
}
