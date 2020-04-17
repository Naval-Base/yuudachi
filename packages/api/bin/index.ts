import 'reflect-metadata';

import Rest from '@spectacles/rest';
import { Boom, isBoom, notFound } from '@hapi/boom';
import { resolve } from 'path';
import polka = require('polka');
import { Request } from 'polka';
import postgres = require('postgres');
import readdirp = require('readdirp');
import { container } from 'tsyringe';

import Route, { pathToRouteInfo } from '../src/Route';
import { sendBoom } from '../src/util';
import { kSQL } from '../src/tokens';

const token = process.env.DISCORD_TOKEN;

const rest = new Rest({ token });
const pg = postgres();

container.register(Rest, { useValue: rest });
container.register(kSQL, { useValue: pg });

const server = polka<Request>({
	onError(err, req, res, next) {
		console.error(err);
		if (isBoom(err as any)) sendBoom(err as any, res);
		else sendBoom(new Boom(err), res);
	},
	onNoMatch(req, res) {
		sendBoom(notFound(), res);
	},
});

const files = readdirp(resolve(__dirname, '..', 'src', 'routes'), {
	fileFilter: '*.js',
});

(async () => {
	for await (const dir of files) {
		const routeInfo = pathToRouteInfo(dir.path);
		if (!routeInfo) continue;

		console.log(routeInfo);
		const { path, method } = routeInfo;
		const route = container.resolve<Route>(require(dir.fullPath).default);

		server[method](path, ...route.middleware, async (req, res, next) => {
			try {
				await route.handle(req, res, next!);
			} catch (e) {
				next!(e);
			}
		});
	}
})();

server.listen(3000);
