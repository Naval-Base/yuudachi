import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { createServer, IncomingMessage } from 'http';
const polka = require('polka'); // eslint-disable-line
import { buildSchema } from 'type-graphql';
import database from './structures/Database';
import { Connection } from 'typeorm';
import { verify } from 'jsonwebtoken';
import * as cors from 'cors';

import { GuildResolver } from './gql/resolvers/Guild';
import { User, UserResolver } from './gql/resolvers/User';
import { SettingResolver } from './gql/resolvers/Setting';

declare module 'http' {
	interface IncomingMessage {
		user: User | null;
		token: string | null;
	}
}

export interface Context {
	req: IncomingMessage;
	db: Connection;
}

async function main(): Promise<void> {
	const db = database.get('yukikaze');
	await db.connect();

	const schema = await buildSchema({
		resolvers: [UserResolver, GuildResolver, SettingResolver]
	});

	const server = new ApolloServer({
		schema,
		context: ({ req }: { req: IncomingMessage }) => ({
			req,
			db
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
			: null;
		if (!token) {
			req.user = null;
			req.token = null;
			return next();
		}

		try {
			const { access_token, user } = verify(token, process.env.JWT_SECRET!) as { access_token: string; user: User };
			req.user = user;
			req.token = access_token;
		} catch (error) {
			console.error(error);
			req.user = null;
			req.token = null;
		}

		return next();
	});

	server.applyMiddleware({ app: app, path: '/graphql', cors: false });
	const http = createServer(app.handler);
	server.installSubscriptionHandlers(http);

	http.listen(5000, () => {
		console.log(`> Server ready at http://localhost:5000${server.graphqlPath}`);
		console.log(`> Subscription server ready at ws://localhost:5000${server.subscriptionsPath}`);
	});
}

main();
