import 'reflect-metadata';

import { Amqp } from '@spectacles/brokers';
import type { AmqpResponseOptions } from '@spectacles/brokers/typings/src/Amqp';
import { on } from 'events';
import postgres from 'postgres';
import Redis from 'ioredis';
import { resolve } from 'path';
import readdirp from 'readdirp';
import API from '@yuudachi/api';
import Rest, { createAmqpBroker } from '@yuudachi/rest';
import { container } from 'tsyringe';
import { APIGuildInteraction, GatewayDispatchEvents, InteractionType } from 'discord-api-types/v8';
import i18next from 'i18next';
// @ts-expect-error
import Backend from 'i18next-fs-backend';
import { Tokens, transformInteraction } from '@yuudachi/core';
import { CommandModules } from '@yuudachi/types';

import Command, { commandInfo } from '../src/Command';
import Component, { componentInfo } from '../src/Component';
import { has, send } from '../src/util';

const { kGateway, kSQL, kRedis } = Tokens;

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('missing DISCORD_TOKEN');

const apiURL = process.env.API_URL;
if (!apiURL) throw new Error('missing API_URL');

const api = new API(apiURL);
const restBroker = createAmqpBroker('rest');
const rest = new Rest(token, restBroker);
const gatewayBroker = new Amqp('gateway');
const sql = postgres();
const redis = new Redis('redis://redis:6379');

container.register(API, { useValue: api });
container.register(Rest, { useValue: rest });
container.register(kGateway, { useValue: gatewayBroker });
container.register(kSQL, { useValue: sql });
container.register(kRedis, { useValue: redis });

const commands = new Map<string, Command>();
const components = new Map<string, Component>();

const commandFiles = readdirp(resolve(__dirname, '..', 'src', 'commands'), {
	fileFilter: '*.js',
	directoryFilter: '!sub',
});

const componentFiles = readdirp(resolve(__dirname, '..', 'src', 'components'), {
	fileFilter: '*.js',
	directoryFilter: '!sub',
});

const interactionCreate = async () => {
	for await (const [interaction, { ack }] of on(
		gatewayBroker,
		GatewayDispatchEvents.InteractionCreate,
	) as AsyncIterableIterator<[APIGuildInteraction, AmqpResponseOptions]>) {
		ack();

		console.log(interaction);

		const [data] = await sql<
			[
				{
					locale: string | null;
					modules: number | null;
				}?,
			]
		>`select locale, modules
			from guild_settings
			where guild_id = ${interaction.guild_id}`;

		const locale = data?.locale ?? 'en';
		const modules =
			data?.modules ?? CommandModules.Config | CommandModules.Utility | CommandModules.Moderation | CommandModules.Tags;

		if (interaction.type === InteractionType.ApplicationCommand) {
			const command = commands.get(interaction.data?.name ?? '');
			if (command && interaction.data) {
				if (!has(modules, command.category)) {
					void send(interaction, {
						content: i18next.t('command.common.errors.no_enabled_module', { module: command.category, lng: locale }),
						flags: 64,
					});
					continue;
				}
				try {
					await command.execute(
						interaction,
						transformInteraction(interaction.data.options ?? [], interaction.data.resolved),
						locale,
					);
				} catch (error) {
					console.error(error);
					void send(interaction, {
						content: error.message,
						flags: 64,
					});
				}

				continue;
			}
		} else {
			// @ts-expect-error
			const component = components.get(interaction.data.custom_id.split('|')[0]);
			if (component && interaction.data) {
				try {
					await component.execute(interaction, [], locale);
				} catch (error) {
					console.error(error);
					void send(interaction, {
						content: error.message,
						flags: 64,
					});
				}

				continue;
			}
		}

		void send(interaction, {
			content: i18next.t('command.common.errors.generic', { lng: locale }),
			flags: 64,
		});
		continue;
	}
};

void (async () => {
	const conn = await gatewayBroker.connect('rabbitmq');
	await gatewayBroker.subscribe([
		GatewayDispatchEvents.MessageCreate,
		GatewayDispatchEvents.InteractionCreate,
		GatewayDispatchEvents.GuildMembersChunk,
	]);

	await restBroker.connect(conn);

	await i18next.use(Backend).init({
		backend: {
			loadPath: resolve(__dirname, '..', 'locales', '{{lng}}', '{{ns}}.json'),
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

		console.log(cmdInfo);
		const command = container.resolve<Command>((await import(dir.fullPath)).default);
		commands.set(command.name ?? cmdInfo.name, command);
	}

	for await (const dir of componentFiles) {
		const cmptInfo = componentInfo(dir.path);
		if (!cmptInfo) continue;

		console.log(cmptInfo);
		const component = container.resolve<Component>((await import(dir.fullPath)).default);
		components.set(component.name ?? cmptInfo.name, component);
	}

	void interactionCreate();
})();
