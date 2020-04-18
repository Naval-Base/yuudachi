import { badData } from '@hapi/boom';
import { Request, Response, NextHandler } from 'polka';
import { USER_ID_HEADER } from '../Constants';

export default function authorize(req: Request, res: Response, next?: NextHandler) {
	let userId = req.headers[USER_ID_HEADER];
	if (Array.isArray(userId)) userId = userId[0];

	if (!userId) return next?.(badData(`missing "${USER_ID_HEADER}" header`));

	// TODO: verify user ID with authorization server
	req.userId = userId;
	next?.();
}
