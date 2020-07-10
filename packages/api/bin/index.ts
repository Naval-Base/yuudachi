import 'reflect-metadata';

import Rest from '@spectacles/rest';
import { resolve } from 'path';
import postgres from 'postgres';
import readdirp from 'readdirp';
import { container } from 'tsyringe';

import Route, { pathToRouteInfo } from '../src/Route';
import createApp from '../src/app';
import { kSQL } from '../src/tokens';

const token = process.env.DISCORD_TOKEN;

const rest = new Rest({ token });
const pg = postgres({ debug: console.log });

container.register(Rest, { useValue: rest });
container.register(kSQL, { useValue: pg });

const app = createApp();

const files = readdirp(resolve(__dirname, '..', 'src', 'routes'), {
	fileFilter: '*.js',
});

void (async () => {
	for await (const dir of files) {
		const routeInfo = pathToRouteInfo(dir.path);
		if (!routeInfo) continue;

		console.log(routeInfo);
		const route = container.resolve<Route>((await import(dir.fullPath)).default);
		route.register(routeInfo, app);
	}
})();

app.listen(3000);
