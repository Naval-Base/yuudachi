import { Request, Response, NextHandler } from 'polka';
import { badRequest } from '@hapi/boom';

export default async function bodyParser(req: Request, res: Response, next?: NextHandler) {
	if (!req.headers['content-type']?.startsWith('application/json')) return next?.(badRequest('unexpected content type'));

	try {
		const chunks: Buffer[] = [];
		for await (const chunk of req) chunks.push(chunk);

		const data = Buffer.concat(chunks).toString('utf8');
		req.body = JSON.parse(data);

		next?.();
	} catch (e) {
		next?.(e);
	}
}
