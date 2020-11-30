import 'reflect-metadata';

import { join, resolve } from 'path';
import postgres from 'postgres';
import readdirp from 'readdirp';
import Rest, { createAmqpBroker } from '@yuudachi/rest';
import { container } from 'tsyringe';
import { Config } from '@yuudachi/types';
import { createApp, Route, pathToRouteInfo } from '@yuudachi/http';
import { Tokens } from '@yuudachi/core';

const { kSQL, kConfig } = Tokens;

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('no discord token');

const restBroker = createAmqpBroker('rest');
const rest = new Rest(token, restBroker);
const pg = postgres();

container.register(Rest, { useValue: rest });
container.register(kSQL, { useValue: pg });
container.register<Pick<Config, 'secretKey'>>(kConfig, {
	useValue: {
		secretKey: process.env.JWT_SECRET!,
	},
});

const app = createApp(join(__dirname, '..', 'public'));

const files = readdirp(resolve(__dirname, '..', 'src', 'routes'), {
	fileFilter: '*.js',
});

void (async () => {
	await restBroker.connect('rabbitmq');

	for await (const dir of files) {
		const routeInfo = pathToRouteInfo(dir.path);
		if (!routeInfo) continue;

		console.log(routeInfo);
		const route = container.resolve<Route>((await import(dir.fullPath)).default);
		route.register(routeInfo, app);
	}
})();

app.listen(3500);
