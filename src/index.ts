import 'reflect-metadata';

import { Client, Intents, Options, Util, Webhook } from 'discord.js';
import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import readdirp from 'readdirp';
import { container } from 'tsyringe';
import postgres from 'postgres';
import Redis from 'ioredis';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import Bree from 'bree';
import { readFile } from 'node:fs/promises';

import { Command, commandInfo } from './Command';
import { kBree, kCommands, kRedis, kSQL, kWebhooks } from './tokens';
import { logger } from './logger';
import type { Event } from './Event';
import { WebSocketConnection } from './websocket/WebSocketConnection';
import { scamDomainRequestHeaders } from './functions/anti-scam/refreshScamDomains';

const sql = postgres({
	types: {
		date: {
			to: 1184,
			from: [1082, 1083, 1114, 1184],
			serialize: (date: Date) => date.toISOString(),
			parse: (isoString) => isoString,
		},
	},
});
const redis = new Redis(process.env.REDISHOST);
const bree = new Bree({ root: false, logger });

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES,
	],
	partials: ['GUILD_MEMBER'],
	makeCache: Options.cacheWithLimits({
		// @ts-expect-error
		ChannelManager: {
			sweepInterval: 3600,
			sweepFilter: Util.archivedThreadSweepFilter(),
		},
		GuildChannelManager: {
			sweepInterval: 3600,
			sweepFilter: Util.archivedThreadSweepFilter(),
		},
		MessageManager: 100,
		StageInstanceManager: 10,
		ThreadManager: {
			sweepInterval: 3600,
			sweepFilter: Util.archivedThreadSweepFilter(),
		},
		VoiceStateManager: 10,
	}),
});
client.setMaxListeners(20);

const commands = new Map<string, Command>();
const webhooks = new Map<string, Webhook>();

container.register(Client, { useValue: client });
container.register(kSQL, { useValue: sql });
container.register(kRedis, { useValue: redis });
container.register(kBree, { useValue: bree });
container.register(kCommands, { useValue: commands });
container.register(kWebhooks, { useValue: webhooks });

const commandFiles = readdirp(fileURLToPath(new URL('./commands', import.meta.url)), {
	fileFilter: '*.js',
	directoryFilter: '!sub',
});

const eventFiles = readdirp(fileURLToPath(new URL('./events', import.meta.url)), {
	fileFilter: '*.js',
});

try {
	const shorteners = JSON.parse(
		(await readFile(fileURLToPath(new URL('../linkshorteners.json', import.meta.url).href))).toString(),
	);
	await redis.sadd('linkshorteners', ...shorteners);
	await i18next.use(Backend).init({
		backend: {
			loadPath: fileURLToPath(new URL('./locales/{{lng}}/{{ns}}.json', import.meta.url)),
		},
		cleanCode: true,
		fallbackLng: ['en-US'],
		defaultNS: 'translation',
		lng: 'en-US',
		ns: ['translation'],
	});

	for await (const dir of commandFiles) {
		const cmdInfo = commandInfo(dir.path);
		if (!cmdInfo) continue;

		const command = container.resolve<Command>((await import(pathToFileURL(dir.fullPath).href)).default);
		logger.info(
			{ command: { name: command.name ?? cmdInfo.name } },
			`Registering command: ${command.name ?? cmdInfo.name}`,
		);

		commands.set((command.name ?? cmdInfo.name).toLowerCase(), command);
	}

	for await (const dir of eventFiles) {
		const event_ = container.resolve<Event>((await import(pathToFileURL(dir.fullPath).href)).default);
		logger.info({ event: { name: event_.name, event: event_.event } }, `Registering event: ${event_.name}`);

		if (event_.disabled) {
			continue;
		}
		event_.execute();
	}

	await client.login();

	const wsURL = process.env.SCAM_DOMAIN_WS;
	if (wsURL) {
		new WebSocketConnection(process.env.SCAM_DOMAIN_WS!, scamDomainRequestHeaders['SCAM_DOMAIN_URL'], redis);
	} else {
		logger.info(`Missing env var 'SCAM_DOMAIN_WS`);
	}
} catch (e) {
	const error = e as Error;
	logger.error(error, error.message);
}
