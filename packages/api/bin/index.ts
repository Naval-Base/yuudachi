import 'reflect-metadata';

import { Amqp } from '@spectacles/brokers';
import { resolve } from 'path';
import postgres from 'postgres';
import readdirp from 'readdirp';
import Rest from 'rest';
import { container } from 'tsyringe';

import Route, { pathToRouteInfo } from '../src/Route';
import createApp from '../src/app';
import { kSQL } from '../src/tokens';

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('no discord token');

const amqpUrl = process.env.AMQP_URL;
if (!amqpUrl) throw new Error('no AMQP url');

const amqp = new Amqp('rest');
const rest = new Rest(token, amqp);
const pg = postgres({ debug: console.log });

container.register(Rest, { useValue: rest });
container.register(kSQL, { useValue: pg });

const app = createApp();

const files = readdirp(resolve(__dirname, '..', 'src', 'routes'), {
	fileFilter: '*.js',
});

void (async () => {
	await amqp.connect(amqpUrl);

	for await (const dir of files) {
		const routeInfo = pathToRouteInfo(dir.path);
		if (!routeInfo) continue;

		console.log(routeInfo);
		const route = container.resolve<Route>((await import(dir.fullPath)).default);
		route.register(routeInfo, app);
	}
})();

app.listen(3000);
