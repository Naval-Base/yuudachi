import 'reflect-metadata';

import { Client, Intents, Options, Webhook } from 'discord.js';
import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import readdirp from 'readdirp';
import { container } from 'tsyringe';
import postgres from 'postgres';
import Redis from 'ioredis';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import Bree from 'bree';

import { Command, commandInfo } from './Command';
import { kBree, kCommands, kRedis, kSQL, kWebhooks } from './tokens';
import { logger } from './logger';
import type { Event } from './Event';

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
	makeCache: Options.cacheWithLimits({
		GuildMemberManager: 10,
		MessageManager: 100,
		StageInstanceManager: 10,
		ThreadMemberManager: 10,
		UserManager: 10,
		VoiceStateManager: 10,
	}),
});

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
		commands.set(command.name ?? cmdInfo.name, command);
	}

	for await (const dir of eventFiles) {
		const event_ = container.resolve<Event>((await import(pathToFileURL(dir.fullPath).href)).default);
		if (event_.disabled) {
			continue;
		}
		event_.execute();
	}

	await client.login();
} catch (e) {
	logger.error(e);
}
