import type { Guild, GuildMember, User } from 'discord.js';
import type { Redis } from 'ioredis';
import { Case, CaseAction, CreateCase, createCase } from '../functions/cases/createCase.js';
import { generateCasePayload, GenerateCasePayloadOptions } from '../functions/logging/generateCasePayload.js';
import { upsertCaseLog } from '../functions/logging/upsertCaseLog.js';

export class RawModAction {
	public guild: Guild;
	public caseOptions: CreateCase & {
		target?: GuildMember | null | undefined;
	};

	public case_: Case | null;
	public user: User | null | undefined;
	public action: CaseAction;
	public actionKey: string | null;
	public redis: Redis | undefined;

	public constructor(
		guild: Guild,
		caseOptions: CreateCase & {
			target?: GuildMember | null | undefined;
		},
		redis?: Redis,
	) {
		this.guild = guild;
		this.caseOptions = caseOptions;
		this.action = caseOptions.action;
		this.user = caseOptions.target?.user;
		this.case_ = null;

		this.redis = redis;

		this.actionKey = this.actionToKey();
	}

	public async takeAction(skipAction = false, skipLog = false): Promise<void> {
		await this.handleRedis();

		const case_ = await createCase(this.guild, this.caseOptions, skipAction);

		if (!skipLog) {
			await upsertCaseLog(this.guild.id, this.user, case_);
		}
	}

	public async handleRedis(): Promise<void> {
		if (!this.actionKey || !this.redis) return;

		if (this.action === CaseAction.Softban) {
			await this.redis.setex(`guild:${this.guild.id}:user:${this.caseOptions.targetId}:unban`, 15, '');
			await this.redis.setex(`guild:${this.guild.id}:user:${this.caseOptions.targetId}:unban`, 15, '');

			return;
		}

		await this.redis.setex(`guild:${this.guild.id}:user:${this.caseOptions.targetId}:${this.actionKey}`, 15, '');
	}

	public actionToKey(): string | null {
		switch (this.action) {
			case CaseAction.Ban:
				return 'ban';
			case CaseAction.Unban:
				return 'unban';
			case CaseAction.Kick:
				return 'kick';
			case CaseAction.Timeout:
				return 'timeout';
			default:
				return null;
		}
	}
}

export default class ModAction extends RawModAction {
	public constructor(guild: Guild, caseOptions: Omit<GenerateCasePayloadOptions, 'guildId'>, redis?: Redis) {
		super(
			guild,
			generateCasePayload({
				...caseOptions,
				guildId: guild.id,
			}),
			redis,
		);
	}
}
