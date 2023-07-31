import { on } from "node:events";
import { logger, kSQL } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import { Client, Events, type GuildMember } from "discord.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { Sql } from "postgres";
import { inject, injectable } from "tsyringe";
import { CaseAction } from "../../functions/cases/createCase.js";
import type { RawCase } from "../../functions/cases/transformCase.js";

@injectable()
export default class implements Event {
	public name = "Role assignment";

	public event = Events.GuildMemberAdd as const;

	public constructor(public readonly client: Client<true>, @inject(kSQL) public readonly sql: Sql<any>) {}

	public async execute(): Promise<void> {
		for await (const [guildMember] of on(this.client, this.event) as AsyncIterableIterator<[GuildMember]>) {
			try {
				logger.info(
					{ event: { name: this.name, event: this.event }, guildId: guildMember.guild.id, memberId: guildMember.id },
					"Checking for non-processed cases",
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
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error, error.message);
			}
		}
	}
}
