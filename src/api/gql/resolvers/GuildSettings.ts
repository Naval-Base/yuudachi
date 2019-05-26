import { ObjectType, Field, Int } from 'type-graphql';
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
