import { Case, CaseAction } from '@yuudachi/types';
import { forbidden, notFound } from '@hapi/boom';
import Joi from 'joi';
import { Request, Response } from 'polka';
import { injectable } from 'tsyringe';

import Route from '../../../../Route';
import { authorize, validate, bodyParser } from '../../../../middleware';
import CaseManager from '../../../../managers/CaseManager';
import { HttpException } from '@yuudachi/rest';

interface CasesPostBody {
	cases: Case[];
}

@injectable()
export default class CreateCaseRoute extends Route {
	public middleware = [
		bodyParser,
		validate(
			Joi.object()
				.keys({
					cases: Joi.array()
						.items(
							Joi.object()
								.keys({
									action: Joi.number().integer().min(0).max(6).required(),
									roleId: Joi.when('action', {
										is: CaseAction.ROLE,
										then: Joi.string()
											.pattern(/\d{17,20}/)
											.required(),
										otherwise: Joi.forbidden(),
									}),
									actionExpiration: Joi.when('action', {
										is: Joi.valid(CaseAction.ROLE, CaseAction.BAN),
										then: Joi.date(),
										otherwise: Joi.forbidden(),
									}),
									reason: Joi.string().required(),
									targetId: Joi.string()
										.pattern(/\d{17,20}/)
										.required(),
									deleteMessageDays: Joi.when('action', {
										is: Joi.valid(CaseAction.BAN, CaseAction.SOFTBAN),
										then: Joi.number().positive().max(7).default(1),
										otherwise: Joi.forbidden(),
									}),
									contextMessageId: Joi.string().pattern(/\d{17,20}/),
									referenceId: Joi.number(),
								})
								.required(),
						)
						.min(1),
				})
				.required(),
		),
		authorize,
	];

	public constructor(public readonly caseManager: CaseManager) {
		super();
	}

	public async handle(req: Request, res: Response) {
		const created: Promise<Case>[] = [];
		const body: CasesPostBody = req.body as any;

		for (const case_ of body.cases) {
			case_.guildId = req.params.guildId;
			case_.moderatorId = req.userId!;
			created.push(this.caseManager.create(case_));
		}

		let cases: Case[];
		try {
			cases = await Promise.all(created);
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
		res.end(JSON.stringify({ cases }));
	}
}
