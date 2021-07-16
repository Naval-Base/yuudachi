import 'reflect-metadata';

import { Client, Intents } from 'discord.js';
import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import readdirp from 'readdirp';
import { container } from 'tsyringe';
import postgres from 'postgres';
import Redis from 'ioredis';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

import { Command, commandInfo } from './Command';
import { kCommands, kRedis, kSQL } from './tokens';
import { logger } from './logger';
import type { Event } from './Event';

const sql = postgres();
const redis = new Redis(process.env.REDISHOST);

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES,
	],
});

const commands = new Map<string, Command>();

container.register(Client, { useValue: client });
container.register(kSQL, { useValue: sql });
container.register(kRedis, { useValue: redis });
container.register(kCommands, { useValue: commands });

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
		event_.execute();
	}

	await client.login();
} catch (e) {
	logger.error(e);
}
