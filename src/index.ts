import 'reflect-metadata';

import { Client, Constants, Intents, Interaction } from 'discord.js';
import { on } from 'node:events';
import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import readdirp from 'readdirp';
import { container } from 'tsyringe';
import postgres from 'postgres';
/* import Redis from 'ioredis'; */
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

import { Command, commandInfo } from './Command.js';
import { /* kRedis, */ kSQL } from './tokens.js';
import { transformInteraction } from './InteractionOptions.js';

const sql = postgres();
/* const redis = new Redis('redis://redis:6379'); */

container.register(kSQL, { useValue: sql });
/* container.register(kRedis, { useValue: redis }); */

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

const commandFiles = readdirp(fileURLToPath(new URL('./commands', import.meta.url)), {
	fileFilter: '*.js',
	directoryFilter: '!sub',
});

const interactionCreate = async () => {
	for await (const [interaction] of on(client, Constants.Events.INTERACTION_CREATE) as AsyncIterableIterator<
		[Interaction]
	>) {
		if (!interaction.isCommand()) {
			continue;
		}

		const command = commands.get(interaction.commandName);
		if (command) {
			try {
				const args = [...interaction.options.values()];
				await command.execute(interaction, transformInteraction(args), 'en');
			} catch (error) {
				console.error(error);
				await interaction.editReply({ content: error.message });
			}
		}

		continue;
	}
};

void (async () => {
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

	void interactionCreate();

	await client.login();
})();
