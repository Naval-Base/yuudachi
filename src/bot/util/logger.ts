import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export enum TOPICS {
	UNHANDLED_REJECTION = 'UNHANDLED_REJECTION',
	DISCORD = 'DISCORD',
	DISCORD_AKAIRO = 'DISCORD_AKAIRO',
	RPC = 'RPC',
	METRICS = 'METRICS',
}

export enum EVENTS {
	INIT = 'INIT',
	DEBUG = 'DEBUG',
	ERROR = 'ERROR',
	WARN = 'WARN',
	READY = 'READY',
	IDENTIFY = 'IDENTIFY',
	DESTROY = 'DESTROY',
	CONNECT = 'CONNECT',
	DISCONNECT = 'DISCONNECT',
	COMMAND_ERROR = 'COMMAND_ERROR',
	COMMAND_BLOCKED = 'COMMAND_BLOCKED',
	COMMAND_CANCELLED = 'COMMAND_CANCELLED',
	COMMAND_STARTED = 'COMMAND_STARTED',
	COMMAND_FINISHED = 'COMMAND_FINISHED',
	MESSAGE_BLOCKED = 'MESSAGE_BLOCKED',
	MUTE = 'MUTE',
	LOCKDOWN = 'LOCKDOWN',
}

export const logger = createLogger({
	format: format.combine(
		format.errors({ stack: true }),
		format.label({ label: 'BOT' }),
		format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
		format.printf((info: any): string => {
			const { timestamp, label, level, message, topic, event, ...rest } = info;
			return `[${timestamp}][${label}][${level.toUpperCase()}][${topic}]${event ? `[${event}]` : ''}: ${message}${
				Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ''
			}`;
		}),
	),
	transports: [
		new transports.Console({
			format: format.colorize({ level: true }),
			level: 'info',
		}),
		new DailyRotateFile({
			format: format.combine(format.timestamp(), format.json()),
			level: 'debug',
			filename: 'yukikaze-%DATE%.log',
			maxFiles: '14d',
		}),
	],
});
