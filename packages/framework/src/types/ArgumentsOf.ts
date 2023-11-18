import type {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	APIGuildMember,
	APIPartialChannel,
	APIRole,
	Permissions,
	APIAttachment,
	ComponentType,
	ModalSubmitActionRowComponent,
	Snowflake,
	APIMessage,
	APIUser,
} from "discord-api-types/v10";
import type { Attachment, Channel, Collection, GuildChannel, GuildMember, Message, Role, User } from "discord.js";

export type CommandPayload = Readonly<{
	name: string;
	type?: ApplicationCommandType | undefined;
}>;

export type ComponentPayload = Readonly<{
	componentType: ComponentType;
	components?: ModalSubmitActionRowComponent[] | undefined;
	customId: string;
	values?: string[] | undefined;
}>;

export const enum Runtime {
	Raw,
	Discordjs,
}

type Option = Readonly<
	{
		name: string;
		required?: boolean | undefined;
	} & (
		| {
				choices?: readonly Readonly<{ name: string; value: number }>[] | undefined;
				type: ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number;
		  }
		| {
				choices?: readonly Readonly<{ name: string; value: string }>[] | undefined;
				type: ApplicationCommandOptionType.String;
		  }
		| {
				options?: readonly Option[] | undefined;
				type: ApplicationCommandOptionType.Subcommand | ApplicationCommandOptionType.SubcommandGroup;
		  }
		| {
				type:
					| ApplicationCommandOptionType.Attachment
					| ApplicationCommandOptionType.Boolean
					| ApplicationCommandOptionType.Channel
					| ApplicationCommandOptionType.Mentionable
					| ApplicationCommandOptionType.Role
					| ApplicationCommandOptionType.User;
		  }
	)
>;

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type TypeIdToType<T, O, C, P> = T extends ApplicationCommandOptionType.Subcommand
	? ArgumentsOfRaw<O, P>
	: T extends ApplicationCommandOptionType.SubcommandGroup
	  ? ArgumentsOfRaw<O, P>
	  : T extends ApplicationCommandOptionType.String
	    ? C extends readonly { value: string }[]
				? C[number]["value"]
				: string
	    : T extends ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number
	      ? C extends readonly { value: number }[]
					? C[number]["value"]
					: number
	      : T extends ApplicationCommandOptionType.Boolean
	        ? boolean
	        : T extends ApplicationCommandOptionType.User
	          ? P extends Runtime.Discordjs
							? { member?: GuildMember | undefined; user: User }
							: { member?: (APIGuildMember & { permissions: Permissions }) | undefined; user: APIUser }
	          : T extends ApplicationCommandOptionType.Channel
	            ? P extends Runtime.Discordjs
								? GuildChannel
								: APIPartialChannel & { permissions: Permissions }
	            : T extends ApplicationCommandOptionType.Role
	              ? P extends Runtime.Discordjs
									? Role
									: APIRole
	              : T extends ApplicationCommandOptionType.Mentionable
	                ? P extends Runtime.Discordjs
										? Role | { member?: GuildMember; user: User } | undefined
										:
												| APIRole
												| { member?: (APIGuildMember & { permissions: Permissions }) | undefined; user: APIUser }
												| undefined
	                : T extends ApplicationCommandOptionType.Attachment
	                  ? P extends Runtime.Discordjs
											? Attachment
											: APIAttachment
	                  : never;

type OptionToObject<O, P> = O extends {
	choices?: infer C | undefined;
	name: infer K;
	options?: infer O | undefined;
	required?: infer R | undefined;
	type: infer T;
}
	? K extends string
		? R extends true
			? { [k in K]: TypeIdToType<T, O, C, P> }
			: T extends ApplicationCommandOptionType.Subcommand | ApplicationCommandOptionType.SubcommandGroup
			  ? { [k in K]: TypeIdToType<T, O, C, P> }
			  : { [k in K]?: TypeIdToType<T, O, C, P> | undefined }
		: never
	: never;

type ArgumentsOfRaw<O, P> = O extends readonly any[] ? UnionToIntersection<OptionToObject<O[number], P>> : never;

export type ArgumentsOf<
	C extends CommandPayload | ComponentPayload,
	P extends Runtime = Runtime.Discordjs,
> = C extends {
	options: readonly Option[];
}
	? UnionToIntersection<OptionToObject<C["options"][number], P>>
	: C extends { type: ApplicationCommandType.Message }
	  ? { message: P extends Runtime.Discordjs ? Message<true> : APIMessage }
	  : C extends { type: ApplicationCommandType.User }
	    ? P extends Runtime.Discordjs
				? { user: { member?: GuildMember | undefined; user: User } }
				: { user: { member?: (APIGuildMember & { permissions: Permissions }) | undefined; user: APIUser } }
	    : C extends { componentType: ComponentType.Button }
	      ? never
	      : C extends { componentType: ComponentType.ChannelSelect }
	        ? P extends Runtime.Discordjs
						? { channels: Collection<Snowflake, Channel> }
						: { channels: Map<Snowflake, APIPartialChannel & { permissions: Permissions }> }
	        : C extends { componentType: ComponentType.MentionableSelect }
	          ? P extends Runtime.Discordjs
							? {
									members: Collection<Snowflake, GuildMember>;
									roles: Collection<Snowflake, Role>;
									users: Collection<Snowflake, User>;
							  }
							: {
									members: Map<Snowflake, APIGuildMember & { permissions: Permissions }>;
									roles: Map<Snowflake, APIRole>;
									users: Map<Snowflake, APIUser>;
							  }
	          : C extends { componentType: ComponentType.RoleSelect }
	            ? P extends Runtime.Discordjs
								? { roles: Collection<Snowflake, Role> }
								: { roles: Map<Snowflake, APIRole> }
	            : C extends { componentType: ComponentType.StringSelect }
	              ? { values: string[] }
	              : C extends { componentType: ComponentType.TextInput }
	                ? { value: string }
	                : C extends { componentType: ComponentType.UserSelect }
	                  ? P extends Runtime.Discordjs
											? { members: Collection<Snowflake, GuildMember>; users: Collection<Snowflake, User> }
											: {
													members: Map<Snowflake, APIGuildMember & { permissions: Permissions }>;
													users: Map<Snowflake, APIUser>;
											  }
	                  : never;
