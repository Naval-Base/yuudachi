import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { createServer, IncomingMessage } from 'http';
const polka = require('polka'); // eslint-disable-line
import { buildSchema } from 'type-graphql';
import database from './structures/Database';
import { Connection } from 'typeorm';
import { verify } from 'jsonwebtoken';
import * as cors from 'cors';
import * as cookie from 'cookie';
import { Node, NodeSocket } from 'veza';

import { GuildResolver } from './gql/resolvers/Guild';
import { OAuthUser, OAuthUserResolver } from './gql/resolvers/User';
import { GuildSettingsResolver } from './gql/resolvers/GuildSettings';
import { TagResolver } from './gql/resolvers/Tag';

declare module 'http' {
	interface IncomingMessage {
		user: OAuthUser | null;
		token: string | null;
	}
}

export interface Context {
	req: IncomingMessage;
	db: Connection;
	node: NodeSocket;
}

async function main(): Promise<void> {
	const db = database.get('yukikaze');
	await db.connect();

	// @ts-ignore
	const node = await new Node('api')
		.on('error', (error, client) => console.error(`> IPC error from ${client.name}`, error))
		.on('client.disconnect', client => console.log(`> IPC client diconnected: ${client.name}`))
		.on('client.destroy', client => console.log(`> IPC client destroyed: ${client.name}`))
		.on('client.ready', client => console.log(`> IPC connected to: ${client.name}`))
		.connectTo('bot', 9512);

	const schema = await buildSchema({
		resolvers: [OAuthUserResolver, GuildResolver, GuildSettingsResolver, TagResolver]
	});

	const server = new ApolloServer({
		schema,
		context: ({ req }: { req: IncomingMessage }) => ({
			req,
			db,
			node
		})
	});

	const app = polka();

	app.use(cors({
		origin: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:8000'],
		credentials: true,
		allowedHeaders: ['Accept', 'Content-Type'],
		optionsSuccessStatus: 200
	}));
	app.use(async (req: IncomingMessage, _: unknown, next: Function) => {
		if (!req.headers) {
			req.user = null;
			req.token = null;
			return next();
		}

		const token = req.headers.authorization
			? req.headers.authorization.startsWith('Bearer ')
				? req.headers.authorization.split(' ')[1]
				: null
			: cookie.parse(req.headers.cookie || '').token;
		if (!token) {
			req.user = null;
			req.token = null;
			return next();
		}

		try {
			const { access_token, user } = verify(token, process.env.JWT_SECRET!) as { access_token: string; user: OAuthUser };
			req.user = user;
			req.token = access_token;
		} catch {
			req.user = null;
			req.token = null;
		}

		return next();
	});

	server.applyMiddleware({ app: app, path: '/graphql', cors: false });
	const http = createServer(app.handler);
	server.installSubscriptionHandlers(http);

	http.listen(process.env.PORT!, () => {
		console.log(`> Server ready at http://localhost:5000${server.graphqlPath}`);
		console.log(`> Subscription server ready at ws://localhost:5000${server.subscriptionsPath}`);
	});
}

main();
