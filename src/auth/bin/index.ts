import 'reflect-metadata';

import { resolve } from 'path';
import postgres from 'postgres';
import readdirp from 'readdirp';
import { container } from 'tsyringe';
import { Config } from '@yuudachi/types';
import { createApp, Route, pathToRouteInfo } from '@yuudachi/http';
import { Tokens } from '@yuudachi/core';

const { kSQL, kConfig } = Tokens;

const pg = postgres();

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
	for await (const dir of files) {
		const routeInfo = pathToRouteInfo(dir.path);
		if (!routeInfo) continue;

		console.log(routeInfo);
		const route = container.resolve<Route>((await import(dir.fullPath)).default);
		route.register(routeInfo, app);
	}
})();

app.listen(3600);
