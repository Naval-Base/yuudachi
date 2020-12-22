import { Case } from '@yuudachi/types';
import { notFound } from '@hapi/boom';
import Joi from 'joi';
import { Request, Response } from 'polka';
import { injectable } from 'tsyringe';
import { Route } from '@yuudachi/http';
import { HttpException } from '@yuudachi/rest';
import { bodyParser } from '@yuudachi/core';

import { validate } from '../../../../middleware';
import CaseManager, { PatchCase } from '../../../../managers/CaseManager';

interface CasesPatchBody {
	cases: PatchCase[];
}

@injectable()
export default class UpdateCaseRoute extends Route {
	public middleware = [
		bodyParser,
		validate(
			Joi.object()
				.keys({
					cases: Joi.array()
						.items(
							Joi.object()
								.keys({
									actionExpiration: Joi.date(),
									caseId: Joi.number().required(),
									contextMessageId: Joi.string().pattern(/\d{17,20}/),
									reason: Joi.string(),
									referenceId: Joi.number(),
								})
								.required(),
						)
						.min(1),
				})
				.required(),
		),
	];

	public constructor(public readonly caseManager: CaseManager) {
		super();
	}

	public async handle(req: Request, res: Response) {
		const created: Promise<Case>[] = [];
		const body: CasesPatchBody = req.body as any;

		for (const case_ of body.cases) {
			case_.guildId = req.params.guildId;
			created.push(this.caseManager.update(case_));
		}

		let cases: PatchCase[];
		try {
			cases = await Promise.all(created);
		} catch (e) {
			if (e instanceof HttpException) {
				switch (e.status) {
					case 404:
						throw notFound(e.body);
				}
			}

			throw e;
		}

		res.statusCode = 200;
		res.setHeader('content-type', 'application/json; charset=utf-8');
		res.end(JSON.stringify({ cases }));
	}
}
