import type {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	APIGuildMember,
	APIPartialChannel,
	APIRole,
	Permissions,
	APIAttachment,
	ComponentType,
} from "discord-api-types/v10";
import type { Attachment, GuildChannel, GuildMember, Message, Role, User } from "discord.js";

export type SharedPayload = Readonly<{
	options?: readonly Option[] | undefined;
}>;

export type CommandPayload = Readonly<{
	name: string;
	type?: ApplicationCommandType | undefined;
}> &
	SharedPayload;

export type ComponentPayload = Readonly<{
	componentType: ComponentType;
	customId: string;
	value?: string | undefined;
}> &
	SharedPayload;

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
		: { user: APIGuildMember & { permissions: Permissions } }
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
		: APIRole | { user: APIGuildMember & { permissions: Permissions } } | undefined
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

export type ArgumentsOf<C extends SharedPayload, P extends Runtime = Runtime.Discordjs> = C extends {
	options: readonly Option[];
}
	? UnionToIntersection<OptionToObject<C["options"][number], P>>
	: C extends { type: ApplicationCommandType.Message }
	? { message: Message<true> }
	: C extends { type: ApplicationCommandType.User }
	? { user: { member?: GuildMember | undefined; user: User } }
	: never;
