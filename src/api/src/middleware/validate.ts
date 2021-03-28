import { boomify } from '@hapi/boom';
import type { AnySchema } from 'joi';
import type { Request, Response, NextHandler } from 'polka';

export default (schema: AnySchema, prop: keyof Request = 'body') => (req: Request, _: Response, next?: NextHandler) => {
	const result = schema.validate(req[prop]);

	if (result.error) {
		next?.(boomify(result.error, { statusCode: 422 }));
	} else {
		req.body = result.value;
		next?.();
	}
};
