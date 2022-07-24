import { on } from 'node:events';
import { Client, Events, type GuildMember } from 'discord.js';
import type { Sql } from 'postgres';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event.js';
import { CaseAction } from '../../functions/cases/createCase.js';
import type { RawCase } from '../../functions/cases/transformCase.js';
import { logger } from '../../logger.js';
import { kSQL } from '../../tokens.js';

@injectable()
export default class implements Event {
	public name = 'Role assignment';

	public event = Events.GuildMemberAdd as const;

	public constructor(public readonly client: Client<true>, @inject(kSQL) public readonly sql: Sql<any>) {}

	public async execute(): Promise<void> {
		for await (const [guildMember] of on(this.client, this.event) as AsyncIterableIterator<[GuildMember]>) {
			try {
				logger.info(
					{ event: { name: this.name, event: this.event }, guildId: guildMember.guild.id, memberId: guildMember.id },
					'Checking for non-processed cases',
				);

				const cases = await this.sql<RawCase[]>`
					select *
					from cases
					where guild_id = ${guildMember.guild.id}
						and target_id = ${guildMember.id}
						and action = ${CaseAction.Role}
						and action_processed = false`;

				if (!cases.length) {
					continue;
				}

				for (const case_ of cases) {
					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: guildMember.guild.id,
							memberId: guildMember.id,
							roleId: case_.role_id!,
						},
						`Assigning role ${case_.role_id!} to ${guildMember.id}`,
					);
					await guildMember.roles.add(case_.role_id!, case_.reason!);
				}
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}
