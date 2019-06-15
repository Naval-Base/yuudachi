import { ObjectType, Resolver, Query, Ctx, Arg, Field, Int } from 'type-graphql';
import { Context } from '../../';
import { Setting } from '../../models/Settings';
import { RestrictRoles } from './RestrictRoles';

export interface GuildSettings {
	prefix?: string;
	moderation?: boolean;
	muteRole?: string;
	restrictRoles?: RestrictRoles;
	modRole?: string;
	modLogChannel?: string;
	caseTotal?: number;
	guildLogs?: string;
	githubRepository?: string;
	defaultDocs?: string;
}

@ObjectType()
export class GuildSettings implements GuildSettings {
	@Field({ nullable: true })
	public prefix?: string;

	@Field({ nullable: true })
	public moderation?: boolean;

	@Field({ nullable: true })
	public muteRole?: string;

	@Field(() => RestrictRoles, { nullable: true })
	public restrictRoles?: RestrictRoles;

	@Field({ nullable: true })
	public modRole?: string;

	@Field({ nullable: true })
	public modLogChannel?: string;

	@Field(() => Int, { nullable: true })
	public caseTotal?: number;

	@Field({ nullable: true })
	public guildLogs?: string;

	@Field({ nullable: true })
	public githubRepository?: string;

	@Field({ nullable: true })
	public defaultDocs?: string;
}

@Resolver()
export class GuildSettingsResolver {
	@Query(() => GuildSettings)
	public async setting(
		@Arg('id') id: string,
		@Ctx() context: Context
	): Promise<GuildSettings | undefined> {
		const settings = context.db.getRepository(Setting);
		const dbGuild = await settings.findOne(id);
		if (!dbGuild) return undefined;
		return dbGuild.settings;
	}
}
