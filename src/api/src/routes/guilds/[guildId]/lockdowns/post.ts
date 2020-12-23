import { Lockdown } from '@yuudachi/types';
import { forbidden, notFound } from '@hapi/boom';
import Joi from 'joi';
import { Request, Response } from 'polka';
import { injectable } from 'tsyringe';
import { Route } from '@yuudachi/http';
import { HttpException } from '@yuudachi/rest';
import { bodyParser } from '@yuudachi/core';

import { validate } from '../../../../middleware';
import LockdownManager from '../../../../managers/LockdownManager';

interface LockdownsPostBody {
	lockdowns: Lockdown[];
}

@injectable()
export default class CreateLockdownRoute extends Route {
	public middleware = [
		bodyParser,
		validate(
			Joi.object()
				.keys({
					lockdowns: Joi.array()
						.items(
							Joi.object()
								.keys({
									channelId: Joi.string()
										.pattern(/\d{17,20}/)
										.required(),
									expiration: Joi.date(),
									moderatorId: Joi.string()
										.pattern(/\d{17,20}/)
										.required(),
									reason: Joi.string().optional(),
								})
								.required(),
						)
						.min(1),
				})
				.required(),
		),
	];

	public constructor(public readonly lockdownManager: LockdownManager) {
		super();
	}

	public async handle(req: Request, res: Response) {
		const created: Promise<Lockdown>[] = [];
		const body: LockdownsPostBody = req.body as any;

		for (const lockdown of body.lockdowns) {
			lockdown.guildId = req.params.guildId;
			created.push(this.lockdownManager.create(lockdown));
		}

		let lockdowns: Lockdown[];
		try {
			lockdowns = await Promise.all(created);
		} catch (e) {
			if (e instanceof HttpException) {
				switch (e.status) {
					case 403:
						throw forbidden(e.body);
					case 404:
						throw notFound(e.body);
				}
			}

			throw e;
		}

		res.statusCode = 201;
		res.setHeader('content-type', 'application/json; charset=utf-8');
		res.end(JSON.stringify({ lockdowns }));
	}
}
