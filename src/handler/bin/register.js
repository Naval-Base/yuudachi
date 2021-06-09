/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */

const { Routes } = require('discord-api-types/v8');
const { default: Rest, createAmqpBroker } = require('@yuudachi/rest');
const { Commands } = require('@yuudachi/interactions');

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('missing DISCORD_TOKEN');

const clientId = process.env.DISCORD_CLIENT_ID;
if (!clientId) throw new Error('missing DISCORD_CLIENT_ID');

const guildId = process.env.DISCORD_GUILD_ID;
if (!guildId) throw new Error('missing DISCORD_GUILD_ID');

const restBroker = createAmqpBroker('rest');
const rest = new Rest(token, restBroker);

void (async () => {
	try {
		console.log('Start refreshing interaction (/) commands');
		await restBroker.connect('localhost');
		console.log('Successfully connected to rest broker.');
		await rest.put(Routes.applicationGuildCommands(clientId, guildId), Object.values(Commands));
		console.log('Sucessfully reloaded interaction (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
