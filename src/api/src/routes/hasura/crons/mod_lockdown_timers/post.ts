import { Request, Response } from 'polka';
import { inject, injectable } from 'tsyringe';
import { Route } from '@yuudachi/http';
import { Tokens } from '@yuudachi/core';
import { Sql } from 'postgres';

const { kSQL } = Tokens;

import LockdownManager from '../../../../managers/LockdownManager';

@injectable()
export default class HasuraModLockdownTimersCron extends Route {
	public constructor(@inject(kSQL) public readonly sql: Sql<any>, public readonly lockdownManager: LockdownManager) {
		super();
	}

	public async handle(_: Request, res: Response) {
		const currentLockdowns = await this.sql<{ channel_id: string; expiration: string }>`
			select channel_id, expiration
			from moderation.lockdowns`;

		for (const lockdown of currentLockdowns) {
			if (Date.parse(lockdown.expiration) <= Date.now()) {
				void this.lockdownManager.delete(lockdown.channel_id);
			}
		}

		res.statusCode = 200;
		res.end();
	}
}
