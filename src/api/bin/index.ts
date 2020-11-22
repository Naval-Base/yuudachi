import 'reflect-metadata';

import { resolve } from 'path';
import postgres from 'postgres';
import readdirp from 'readdirp';
import Rest, { createAmqpBroker } from '@yuudachi/rest';
import { container } from 'tsyringe';

import Route, { pathToRouteInfo } from '../src/Route';
import createApp from '../src/app';
import { kSQL, kConfig } from '../src/tokens';
import Config from '../src/Config';

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('no discord token');

const restBroker = createAmqpBroker('rest');
const rest = new Rest(token, restBroker);
const pg = postgres({ debug: console.log });

container.register(Rest, { useValue: rest });
container.register(kSQL, { useValue: pg });
container.register<Config>(kConfig, {
	useValue: {
		secretKey: process.env.JWT_SECRET!,
		discordClientId: process.env.DISCORD_CLIENT_ID!,
		publicApiDomain: process.env.PUBLIC_API_DOMAIN!,
		publicFrontendDomain: process.env.PUBLIC_FRONTEND_DOMAIN!,
		discordScopes: process.env.DISCORD_SCOPES!.split(','),
		discordClientSecret: process.env.DISCORD_CLIENT_SECRET!,
	},
});

const app = createApp();

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
