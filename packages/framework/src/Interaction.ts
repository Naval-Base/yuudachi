import type {
	APIRole as APITypesAPIRole,
	APIAttachment as APITypesAPIAttachment,
	Snowflake,
	APIInteractionDataResolvedChannel as APITypesAPIInteractionDataResolvedChannel,
	APIUser as APITypesAPIUser,
	APIInteractionDataResolvedGuildMember as APITypesAPIInteractionDataResolvedGuildMember,
	APIMessageComponentSelectMenuInteraction as APITypesAPIMessageComponentSelectMenuInteraction,
	APIMessageComponentButtonInteraction as APITypesAPIMessageComponentButtonInteraction,
	APIModalSubmitInteraction as APITypesAPIModalSubmitInteraction,
	APIApplicationCommandInteractionDataOption as APITypesAPIApplicationCommandInteractionDataOption,
	APIInteractionDataResolved as APITypesAPIInteractionDataResolved,
} from "discord-api-types/v10";
import { InteractionType, ComponentType, ApplicationCommandOptionType } from "discord-api-types/v10";
import type {
	ButtonInteraction,
	AnySelectMenuInteraction,
	ModalSubmitInteraction,
	Collection,
	Channel,
	CommandInteractionOption,
	GuildBasedChannel,
	Role,
	User,
	GuildMember,
	Attachment,
	Message,
	CacheType,
	CacheTypeReducer,
	BooleanCache,
	APIInteractionDataResolvedChannel,
	APIRole,
	APIInteractionDataResolvedGuildMember,
	APIGuildMember,
	APIChannel,
} from "discord.js";
import type { ArgumentsOf, CommandPayload, ComponentPayload, Runtime } from "./types/ArgumentsOf.js";

export type Option = {
	attachment?: APITypesAPIAttachment;
	channel?: APITypesAPIInteractionDataResolvedChannel;
	member?: APITypesAPIInteractionDataResolvedGuildMember;
	name: string;
	role?: APITypesAPIRole;
	type: number;
	user?: APITypesAPIUser;
	value?: boolean | number | string;
};

export type TransformResult = Option & {
	options?: Option[];
};

export function transformCommandOption(
	option: APITypesAPIApplicationCommandInteractionDataOption,
	resolved: APITypesAPIInteractionDataResolved,
) {
	const result: TransformResult = {
		name: option.name,
		type: option.type,
	};

	switch (option.type) {
		case ApplicationCommandOptionType.Subcommand:
		case ApplicationCommandOptionType.SubcommandGroup: {
			if ("options" in option) {
				result.options = option.options?.map((opt) => transformCommandOption(opt, resolved));
			}

			break;
		}

		case ApplicationCommandOptionType.Boolean:
		case ApplicationCommandOptionType.Integer:
		case ApplicationCommandOptionType.Number:
		case ApplicationCommandOptionType.String: {
			if ("value" in option) {
				result.value = option.value;
			}

			break;
		}

		case ApplicationCommandOptionType.Attachment:
		case ApplicationCommandOptionType.Channel:
		case ApplicationCommandOptionType.Mentionable:
		case ApplicationCommandOptionType.Role:
		case ApplicationCommandOptionType.User: {
			if (resolved) {
				const attachment = resolved.attachments?.[option.value];
				if (attachment) {
					result.attachment = attachment;
				}

				const channel = resolved.channels?.[option.value];
				if (channel) {
					result.channel = channel;
				}

				const role = resolved.roles?.[option.value];
				if (role) {
					result.role = role;
				}

				const user = resolved.users?.[option.value];
				if (user) {
					result.user = user;
				}

				const member = resolved.members?.[option.value];
				if (member) {
					result.member = member;
				}
			}
		}
	}

	return result;
}

export function transformApplicationInteraction<
	T extends CommandPayload = CommandPayload,
	R extends Runtime = Runtime.Discordjs,
	C extends CacheType = "cached",
>(options: readonly CommandInteractionOption<C>[]): ArgumentsOf<T, R, C> {
	const opts: Record<
		string,
		| ArgumentsOf<T, R, C>
		| Attachment
		| CacheTypeReducer<C, GuildBasedChannel, APIInteractionDataResolvedChannel>
		| CacheTypeReducer<C, Role, APIRole>
		| Message<BooleanCache<C>>
		| boolean
		| number
		| string
		| {
				member: CacheTypeReducer<C, GuildMember, APIInteractionDataResolvedGuildMember> | undefined;
				user: User | undefined;
		  }
		| null
		| undefined
	> = {};

	for (const top of options) {
		switch (top.type) {
			case ApplicationCommandOptionType.Subcommand:
			case ApplicationCommandOptionType.SubcommandGroup:
				opts[top.name] = transformApplicationInteraction<T, R, C>(top.options ? [...top.options] : []);
				break;
			case ApplicationCommandOptionType.User:
				opts[top.name] = { user: top.user, member: top.member };
				break;
			case ApplicationCommandOptionType.Channel:
				opts[top.name] = top.channel;
				break;
			case ApplicationCommandOptionType.Role:
				opts[top.name] = top.role;
				break;
			case ApplicationCommandOptionType.Mentionable:
				opts[top.name] = top.user ? { user: top.user, member: top.member } : top.role;
				break;
			case ApplicationCommandOptionType.Number:
			case ApplicationCommandOptionType.Integer:
			case ApplicationCommandOptionType.String:
			case ApplicationCommandOptionType.Boolean:
				opts[top.name] = top.value;
				break;
			case ApplicationCommandOptionType.Attachment:
				opts[top.name] = top.attachment;
				break;
			// @ts-expect-error: This is actually a string
			case "_MESSAGE":
				opts[top.name] = top.message;
				break;
			default:
				break;
		}
	}

	return opts as ArgumentsOf<T, R, C>;
}

export function transformApplicationInteractionRaw<
	T extends CommandPayload = CommandPayload,
	R extends Runtime = Runtime.Raw,
>(options: readonly TransformResult[]): ArgumentsOf<T, R> {
	const opts: Record<
		string,
		| APITypesAPIAttachment
		| APITypesAPIInteractionDataResolvedChannel
		| APITypesAPIRole
		| ArgumentsOf<T, R>
		| boolean
		| number
		| string
		| {
				member?: APITypesAPIInteractionDataResolvedGuildMember | undefined;
				user?: APITypesAPIUser | undefined;
		  }
		| undefined
	> = {};

	for (const top of options) {
		switch (top.type) {
			case ApplicationCommandOptionType.Subcommand:
			case ApplicationCommandOptionType.SubcommandGroup:
				opts[top.name] = transformApplicationInteractionRaw<T, R>(top.options ? [...top.options] : []);
				break;
			case ApplicationCommandOptionType.User:
				opts[top.name] = { user: top.user, member: top.member };
				break;
			case ApplicationCommandOptionType.Channel:
				opts[top.name] = top.channel;
				break;
			case ApplicationCommandOptionType.Role:
				opts[top.name] = top.role;
				break;
			case ApplicationCommandOptionType.Mentionable:
				opts[top.name] = top.user ? { user: top.user, member: top.member } : top.role;
				break;
			case ApplicationCommandOptionType.Number:
			case ApplicationCommandOptionType.Integer:
			case ApplicationCommandOptionType.String:
			case ApplicationCommandOptionType.Boolean:
				opts[top.name] = top.value;
				break;
			case ApplicationCommandOptionType.Attachment:
				opts[top.name] = top.attachment;
				break;
			default:
				break;
		}
	}

	return opts as ArgumentsOf<T, R>;
}

export function transformComponentInteraction<
	T extends ComponentPayload = ComponentPayload,
	R extends Runtime = Runtime.Discordjs,
	C extends CacheType = "cached",
>(interaction: AnySelectMenuInteraction<C> | ButtonInteraction<C> | ModalSubmitInteraction<C>): ArgumentsOf<T, R, C> {
	const opts: Record<
		string,
		| ArgumentsOf<T, R, C>
		| Collection<Snowflake, CacheTypeReducer<C, Channel, APIChannel, APIChannel | Channel, APIChannel | Channel>>
		| Collection<Snowflake, CacheTypeReducer<C, Role, APIRole, APIRole | Role, APIRole | Role>>
		| string[]
		| string
		| {
				members: Collection<
					Snowflake,
					CacheTypeReducer<C, GuildMember, APIGuildMember, APIGuildMember | GuildMember, APIGuildMember | GuildMember>
				>;
				users: Collection<Snowflake, User>;
		  }
		| undefined
	> = {};

	const messageComponentType = (messageComponentInteraction: AnySelectMenuInteraction<C> | ButtonInteraction<C>) => {
		switch (messageComponentInteraction.componentType) {
			case ComponentType.Button:
				opts[messageComponentInteraction.customId] = messageComponentInteraction.customId;
				break;
			case ComponentType.StringSelect:
				opts[messageComponentInteraction.customId] = messageComponentInteraction.values;
				break;
			case ComponentType.UserSelect:
				opts[messageComponentInteraction.customId] = {
					users: messageComponentInteraction.users,
					members: messageComponentInteraction.members,
				};
				break;
			case ComponentType.ChannelSelect:
				opts[messageComponentInteraction.customId] = messageComponentInteraction.channels;
				break;
			case ComponentType.RoleSelect:
				opts[messageComponentInteraction.customId] = messageComponentInteraction.roles;
				break;
			case ComponentType.MentionableSelect:
				opts[messageComponentInteraction.customId] = messageComponentInteraction.users.size
					? { users: messageComponentInteraction.users, members: messageComponentInteraction.members }
					: messageComponentInteraction.roles;
				break;
			default:
				break;
		}
	};

	switch (interaction.type) {
		case InteractionType.MessageComponent:
			messageComponentType(interaction);
			break;
		case InteractionType.ModalSubmit: {
			const fields = interaction.components.reduce((acc, component) => {
				for (const comp of component.type === ComponentType.ActionRow ? component.components : [component]) {
					if (comp.type === ComponentType.TextInput) {
						acc.set(comp.customId, comp.value);
					}
				}

				return acc;
			}, new Map<string, string>());

			for (const [customId, value] of fields) {
				opts[customId] = value;
			}

			break;
		}

		default:
			break;
	}

	return opts as ArgumentsOf<T, R, C>;
}

export function transformComponentInteractionRaw<
	T extends ComponentPayload = ComponentPayload,
	R extends Runtime = Runtime.Discordjs,
>(
	interaction:
		| APITypesAPIMessageComponentButtonInteraction
		| APITypesAPIMessageComponentSelectMenuInteraction
		| APITypesAPIModalSubmitInteraction,
): ArgumentsOf<T, R> {
	const opts: Record<
		string,
		| ArgumentsOf<T, R>
		| Map<Snowflake, APITypesAPIInteractionDataResolvedChannel>
		| Map<Snowflake, APITypesAPIRole>
		| string[]
		| string
		| { members: Map<Snowflake, APITypesAPIInteractionDataResolvedGuildMember>; users: Map<Snowflake, APITypesAPIUser> }
		| undefined
	> = {};

	const messageComponentType = (
		messageComponentInteraction:
			| APITypesAPIMessageComponentButtonInteraction
			| APITypesAPIMessageComponentSelectMenuInteraction,
	) => {
		switch (messageComponentInteraction.data.component_type) {
			case ComponentType.Button:
				opts[messageComponentInteraction.data.custom_id] = messageComponentInteraction.data.custom_id;
				break;
			case ComponentType.StringSelect:
				opts[messageComponentInteraction.data.custom_id] = messageComponentInteraction.data.values;
				break;
			case ComponentType.UserSelect:
				opts[messageComponentInteraction.data.custom_id] = {
					users: new Map(Object.entries(messageComponentInteraction.data.resolved.users)),
					members: new Map(Object.entries(messageComponentInteraction.data.resolved.members ?? {})),
				};
				break;
			case ComponentType.ChannelSelect:
				opts[messageComponentInteraction.data.custom_id] = new Map(
					Object.entries(messageComponentInteraction.data.resolved.channels),
				);
				break;
			case ComponentType.RoleSelect:
				opts[messageComponentInteraction.data.custom_id] = new Map(
					Object.entries(messageComponentInteraction.data.resolved.roles),
				);
				break;
			case ComponentType.MentionableSelect:
				opts[messageComponentInteraction.data.custom_id] = messageComponentInteraction.data.resolved.users
					? {
							users: new Map(Object.entries(messageComponentInteraction.data.resolved.users ?? {})),
							members: new Map(Object.entries(messageComponentInteraction.data.resolved.members ?? {})),
						}
					: new Map(Object.entries(messageComponentInteraction.data.resolved.roles ?? {}));
				break;
			default:
				break;
		}
	};

	switch (interaction.type) {
		case InteractionType.MessageComponent:
			messageComponentType(interaction);
			break;
		case InteractionType.ModalSubmit: {
			const fields = interaction.data.components.reduce((acc, component) => {
				for (const comp of component.type === ComponentType.ActionRow ? component.components : [component]) {
					if (comp.type === ComponentType.TextInput) {
						acc.set(comp.custom_id, comp.value);
					}
				}

				return acc;
			}, new Map<string, string>());

			for (const [customId, value] of fields) {
				opts[customId] = value;
			}

			break;
		}

		default:
			break;
	}

	return opts as ArgumentsOf<T, R>;
}
