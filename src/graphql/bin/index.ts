import 'reflect-metadata';

import postgres from 'postgres';
import { container } from 'tsyringe';
import { Config } from '@yuudachi/types';
import { createApp } from '@yuudachi/http';
import { authenticate, Constants, Tokens } from '@yuudachi/core';
import { ApolloServer } from 'apollo-server-express';
import API from '@yuudachi/api';
import { Request } from 'polka';

import typeDefs from '../src/typeDefs';
import resolvers from '../src/resolvers';

const { kSQL, kConfig } = Tokens;
const { USER_ID_HEADER } = Constants;

const apiURL = process.env.API_URL;
if (!apiURL) throw new Error('missing API_URL');

const api = new API(apiURL);
const pg = postgres();

container.register(kSQL, { useValue: pg });
container.register(API, { useValue: api });
container.register<Pick<Config, 'secretKey'>>(kConfig, {
	useValue: {
		secretKey: process.env.JWT_SECRET!,
	},
});

const app = createApp();
app.use('/graphql', authenticate(false, true));
const apolloServer = new ApolloServer({
	debug: true,
	typeDefs,
	resolvers,
	context: ({ req }: { req: Request }) => ({ userId: req.auth?.userId ?? req.headers[USER_ID_HEADER] }),
});
apolloServer.applyMiddleware({ app: app as any, path: '/graphql', cors: false });

app.listen(3550);
