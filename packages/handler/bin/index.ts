import 'reflect-metadata';

import Rest from '@spectacles/rest';
import { Amqp } from '@spectacles/brokers';
import { AmqpResponseOptions } from '@spectacles/brokers/typings/src/Amqp';
import { on } from 'events';
import postgres from 'postgres';
import { outputFromJSON, ParserOutput } from 'lexure';
import { resolve } from 'path';
import readdirp from 'readdirp';
import { container } from 'tsyringe';

import Command, { commandInfo } from '../src/Command';
import { BrokerParserOutput } from '../src/types/broker';
import { kSQL } from '../src/tokens';

const token = process.env.DISCORD_TOKEN;

const rest = new Rest({ token });
const broker = new Amqp('gateway');
const pg = postgres();

container.register(Rest, { useValue: rest });
container.register(kSQL, { useValue: pg });

const commands = new Map<string, Command>();

const files = readdirp(resolve(__dirname, '..', 'src', 'commands'), {
	fileFilter: '*.js',
});

void (async () => {
	await broker.connect('rabbitmq');
	await broker.subscribe(['COMMAND']);

	for await (const dir of files) {
		const cmdInfo = commandInfo(dir.path);
		if (!cmdInfo) continue;

		console.log(cmdInfo);
		const command = container.resolve<Command>((await import(dir.fullPath)).default);
		commands.set(command.name ?? cmdInfo.name, command);
		command.aliases?.forEach((alias) => commands.set(alias, command));
	}

	for await (const [message, { ack }] of on(broker, 'COMMAND') as AsyncIterableIterator<
		[BrokerParserOutput, AmqpResponseOptions]
	>) {
		ack();
		const command = commands.get(message.command.value);
		if (!command) continue;

		const res: ParserOutput = outputFromJSON(message.arguments);
		command.execute(message.message, res);
	}
})();
