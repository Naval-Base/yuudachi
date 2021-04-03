import type { Snowflake } from 'discord-api-types/v8';
import { container } from 'tsyringe';
import API from '@yuudachi/api';
import { CaseAction } from '@yuudachi/types';

import { Context } from '../../interfaces/Context';
import { checkAuth } from '../../util/checkAuth';

export default async (
	_: any,
	args: {
		action: {
			guild_id: Snowflake;
			action: CaseAction;
			reason?: string;
			moderatorId: Snowflake;
			targetId: Snowflake;
			contextMessageId?: Snowflake;
			referenceId?: number;
		};
	},
	{ userId }: Context,
) => {
	const api = container.resolve(API);

	if (!(await checkAuth(args.action.guild_id, userId))) {
		return [];
	}

	const cases = await api.guilds.createCase(args.action.guild_id, {
		action: CaseAction.UNBAN,
		reason: args.action.reason,
		moderatorId: args.action.moderatorId,
		targetId: args.action.targetId,
		contextMessageId: args.action.contextMessageId,
		referenceId: args.action.referenceId,
	});

	return cases;
};
