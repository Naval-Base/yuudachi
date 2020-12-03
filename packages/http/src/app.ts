import { isBoom, Boom, notFound } from '@hapi/boom';
import { createServer } from 'http';
import polka from 'polka';
import cors from 'cors';
import helmet from 'helmet';
import cookie from 'cookie';
import sirv from 'sirv';

import { sendBoom } from './util';

declare module 'http' {
	export interface ServerResponse {
		redirect: (redirect: string) => void;
		append: (header: string, value: any) => void;
		cookie: (name: string, data: string, options?: cookie.CookieSerializeOptions) => void;
	}
}

export function createApp(publicFolder?: string) {
	return polka<polka.Request>({
		onError(err, _, res) {
			console.error(err); // TODO: better error logging
			res.setHeader('content-type', 'application/json');
			if (isBoom(err as any)) {
				sendBoom(err as any, res);
			} else {
				sendBoom(new Boom(err), res);
			}
		},
		onNoMatch(_, res) {
			res.setHeader('content-type', 'application/json');
			sendBoom(notFound(), res);
		},
		server: createServer(),
	})
		.use(
			cors({
				origin: process.env.CORS?.split(',') ?? '*',
				credentials: true,
			}) as any,
			helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false }) as any,
			publicFolder
				? sirv(publicFolder, {
						/* istanbul ignore next */
						onNoMatch(_, res) {
							res.setHeader('content-type', 'application/json');
							sendBoom(notFound(), res);
						},
				  })
				: // eslint-disable-next-line @typescript-eslint/no-empty-function
				  (_, res, next) => next?.(),
		)
		.use((_, res, next) => {
			/* istanbul ignore next */
			res.append = (header, value) => {
				const prev = res.getHeader(header);
				if (prev) {
					value = Array.isArray(prev) ? prev.concat(value) : [prev].concat(value);
				}
				res.setHeader(header, value);
			};

			/* istanbul ignore next */
			res.cookie = (name, data, options) => {
				const value = cookie.serialize(name, data, options);
				res.append('Set-Cookie', value);
			};

			/* istanbul ignore next */
			res.redirect = (redirect) => {
				res.statusCode = 302;
				res.append('Location', redirect);
				res.append('Content-Length', 0);
			};

			next?.();
		});
}
