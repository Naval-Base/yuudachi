import { stripIndents } from 'common-tags';
import { User } from 'discord.js';

export enum SETTINGS {
	CASES = 'caseTotal',
	MOD = 'moderation',
	MOD_ROLE = 'modRole',
	MOD_LOG = 'modLogChannel',
	MUTE_ROLE = 'muteRole',
	GITHUB_REPO = 'githubRepository',
	RESTRICT_ROLES = 'restrictRoles',
	GUILD_LOGS = 'guildLogs',
	ROLE_STATE = 'roleState',
	TOKEN_FILTER = 'tokenFiltering',
	DEFAULT_DOCS = 'defaultDocs',
}

export const MESSAGES = {
	COMMAND_HANDLER: {
		PROMPT: {
			MODIFY_START: (str: string) => `${str}\n\nType \`cancel\` to cancel the command.`,
			MODIFY_RETRY: (str: string) => `${str}\n\nType \`cancel\` to cancel the command.`,
			TIMEOUT: 'Guess you took too long, the command has been cancelled.',
			ENDED: "More than 3 tries and you still didn't quite get it. The command has been cancelled.",
			CANCEL: 'The command has been cancelled.',
		},
		LOADED: 'Command handler loaded',
	},
	INHIBITOR_HANDLER: {
		LOADED: 'Inhibitor handler loaded',
	},
	LISTENER_HANDLER: {
		LOADED: 'Listener handler loaded',
	},
	DATABASE: {
		LOADED: (db: string) => `Connected to database ${db}`,
	},
	IPC: {
		ERROR: (client: string, error: Error) => `${client} ${error}`,
		OPEN: 'Server ready',
		CLOSE: 'Server destroyed',
		CONNECT: (client: string) => `${client} connected`,
		DISCONNECT: (client: string) => `${client}, disconnected`,
	},
	SETTINGS: {
		INIT: 'Bot settings initialized',
	},
	CASE_HANDLER: {
		INIT: 'Case handler initialized',
	},
	MUTE_SCHEDULER: {
		INIT: 'Mute scheduler initialized',
	},
	REMIND_SCHEDULER: {
		INIT: 'Remind scheduler initialized',
	},

	COMMANDS: {
		CONFIG: {
			DESCRIPTION: stripIndents`Available methods:
				 • set \`<key> <...arguments>\`
				 • delete \`<key>\`
				 • clear

				Available keys:
				 • cases \`<number>\`
				 • mod \`<Role/RoleId>\`
				 • modLog \`<Channel/ChannelId>\`
				 • muted \`<Role/RoleId>\`
				 • repo \`<repository>\`
				 • restrict
				 • • embed \`<Role/RoleId>\`
				 • • emoji \`<Role/RoleId>\`
				 • • reaction \`<Role/RoleId>\`
				 • • tag \`<Role/RoleId>\`

				Required: \`<>\` | Optional: \`[]\`
			`,
			REPLY: (prefix: string | string[] | Promise<string | string[]>) => stripIndents`
				When you beg me so much I just can't not help you~
				Check \`${prefix}help config\` for more information.
			`,

			CLEAR: {
				DESCRIPTION: 'Clears the guild config.',
				REPLY: 'cleared the guild config.',
			},
			DELETE: {
				DESCRIPTION: 'Deletes a value to the config.',
				REPLY: (prefix: string | string[] | Promise<string | string[]>) => stripIndents`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help config\` for more information.
				`,

				CASES: {
					DESCRIPTION: 'Deletes the case number of the guild.',
					REPLY: 'deleted cases.',
				},
				MOD: {
					DESCRIPTION: 'Deletes the mod role.',
					REPLY: 'deleted moderation role.',
				},
				MOD_LOG: {
					DESCRIPTION: 'Deletes the mod log.',
					REPLY: 'deleted moderation log channel.',
				},
				MUTE: {
					DESCRIPTION: 'Deletes the mute role of the guild.',
					REPLY: 'deleted mute role.',
				},
				REPO: {
					DESCRIPTION: 'Deletes the repository the GitHub commands use.',
					REPLY: 'deleted repository.',
				},
				RESTRICT: {
					DESCRIPTION: 'Deletes the restriction roles of the guild.',
					REPLY: 'deleted restricted roles.',
				},
			},
			SET: {
				DESCRIPTION: 'Sets a value to the config.',
				REPLY: (prefix: string | string[] | Promise<string | string[]>) => stripIndents`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help config\` for more information.
				`,

				RESTRICT: {
					DESCRIPTION: 'Sets the restriction roles of the guild.',
					REPLY: (prefix: string | string[] | Promise<string | string[]>) => stripIndents`
						When you beg me so much I just can't not help you~
						Check \`${prefix}help config\` for more information.
					`,

					EMBED: {
						DESCRIPTION: 'Sets the restriction role for embeds of the guild.',
						PROMPT: {
							START: (author: User | null) => `${author}, what role should act as the embed restricted role?`,
							RETRY: (author: User | null) =>
								`${author}, please mention a proper role to be the embed restricted role.`,
						},
						REPLY: (role: string) => `set restricted role for embeds to **${role}**`,
					},
					EMOJI: {
						DESCRIPTION: 'Sets the restriction role for emojis of the guild.',
						PROMPT: {
							START: (author: User | null) => `${author}, what role should act as the emoji restricted role?`,
							RETRY: (author: User | null) =>
								`${author}, please mention a proper role to be the emoji restricted role.`,
						},
						REPLY: (role: string) => `set restricted role for emojis to **${role}**`,
					},
					REACTION: {
						DESCRIPTION: 'Sets the restriction role for reactions of the guild.',
						PROMPT: {
							START: (author: User | null) => `${author}, what role should act as the reaction restricted role?`,
							RETRY: (author: User | null) =>
								`${author}, please mention a proper role to be the reaction restricted role.`,
						},
						REPLY: (role: string) => `set restricted role for reactions to **${role}**`,
					},
					TAG: {
						DESCRIPTION: 'Sets the restriction role for tags of the guild.',
						PROMPT: {
							START: (author: User | null) => `${author}, what role should act as the tag restricted role?`,
							RETRY: (author: User | null) => `${author}, please mention a proper role to be the tag restricted role.`,
						},
						REPLY: (role: string) => `set restricted role for tags to **${role}**`,
					},
				},
				CASES: {
					DESCRIPTION: 'Sets the case number of the guild.',
					REPLY: (cases: number) => `set cases to **${cases}**`,
				},
				MOD: {
					DESCRIPTION: 'Sets the mod role many of the commands use for permission checking.',
					REPLY: (role: string) => `set moderation role to **${role}**`,
				},
				MOD_LOG: {
					DESCRIPTION: 'Sets the mod log many of the commands use to log moderation actions.',
					REPLY: (channel: string) => `set moderation log channel to **${channel}**`,
				},
				MUTE: {
					DESCRIPTION: 'Sets the mute role of the guild.',
					REPLY: (role: string) => `set mute role to **${role}**`,
				},
				REPO: {
					DESCRIPTION: 'Sets the repository the GitHub commands use.',
					REPLY: (repo: string) => `set repository to **${repo}**`,
				},
			},
			TOGGLE: {
				DESCRIPTION: stripIndents`Available keys:
					 • logs \`<webhook>\`
					 • mod
					 • rolestate
					 • tokenfiltering

					Required: \`<>\` | Optional: \`[]\`
				`,
				REPLY: (prefix: string | string[] | Promise<string | string[]>) => stripIndents`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help toggle\` for more information.
				`,

				LOGS: {
					DESCRIPTION: 'Toggle logs on the server.',
					PROMPT: {
						START: (author: User | null) => `${author}, what Webhook should send the messages?`,
					},
					REPLY_ACTIVATED: 'successfully activated logs!',
					REPLY_DEACTIVATED: 'successfully deactivated logs!',
				},
				MOD: {
					DESCRIPTION: 'Toggle moderation features on the server.',
					REPLY_ACTIVATED: 'successfully activated moderation commands!',
					REPLY_DEACTIVATED: 'successfully deactivated moderation commands!',
				},
				ROLE_STATE: {
					DESCRIPTION: 'Toggle role state on the server.',
					REPLY_ACTIVATED: 'successfully inserted all the records!',
					REPLY_DEACTIVATED: 'successfully removed all records!',
				},
				TOKEN_FILTER: {
					DESCRIPTION: 'Toggle token filtering feature on the server.',
					REPLY_ACTIVATED: 'successfully activated token filtering!',
					REPLY_DEACTIVATED: 'successfully deactivated token filtering!',
				},
			},
		},
		DOCS: {
			DOCS: {
				DESCRIPTION: 'Searches discord.js documentation.',
				PROMPT: {
					START: (author: User | null) => `${author}, what would you like to search for?`,
				},
				FAILURE:
					"Yukikaze couldn't find the requested information. Maybe look for something that actually exists the next time!",
				DEFAULT_DOCS: {
					SUCCESS: (docs: string) => `set the default docs for this server to ${docs}`,
					FAILURE: 'what makes you think you can do that, huh?',
				},
			},
			MDN: {
				DESCRIPTION: 'Searches MDN for your query.',
				PROMPT: {
					START: (author: User | null) => `${author}, what would you like to search for?`,
				},
				FAILURE:
					"Yukikaze couldn't find the requested information. Maybe look for something that actually exists the next time!",
			},
			NPM: {
				DESCRIPTION: 'Responds with information on an NPM package.',
				PROMPT: {
					START: (author: User | null) => `${author}, what would you like to search for?`,
				},
				FAILURE:
					"Yukikaze couldn't find the requested information. Maybe look for something that actually exists the next time!",
				UNPUBLISH: 'whoever was the Commander of this package decided to unpublish it, what a fool.',
			},
		},
		GITHUB: {
			COMMIT: {
				DESCRIPTION: 'Get information on a commit in a predefined repository.',
				FAILURE:
					"Yukikaze couldn't find the requested information. Maybe look for something that actually exists the next time!",
				NO_GITHUB_API_KEY: 'my master has not set a valid GitHub API key, therefore this command is not available.',
				NO_GITHUB_REPO: "the guild owner didn't set a GitHub repository yet.",
			},
			ISSUE_PR: {
				DESCRIPTION: 'Get information on an issue or PR from a predefined repository.',
				FAILURE:
					"Yukikaze couldn't find the requested information. Maybe look for something that actually exists the next time!",
				NO_GITHUB_API_KEY: 'my master has not set a valid GitHub API key, therefore this command is not available.',
				NO_GITHUB_REPO: "the guild owner didn't set a GitHub repository yet.",
			},
			SEARCH: {
				DESCRIPTION: 'Get information on a commit, issue, or PR from a repository.',
				FAILURE:
					"Yukikaze couldn't find the requested information. Maybe look for something that actually exists the next time!",
				NO_GITHUB_API_KEY: 'my master has not set a valid GitHub API key, therefore this command is not available.',
			},
		},
	},
};

export const PROMETHEUS = {
	MESSAGE_COUNTER: 'yukikaze_messages_total',
	COMMAND_COUNTER: 'yukikaze_commands_total',
	LEWDCARIO_AVATAR_COUNTER: 'yukikaze_lewdcario_avatar_total',

	HELP: {
		MESSAGE_COUNTER: 'Total number of messages Yukikaze has seen.',
		COMMAND_COUNTER: 'Total number of commands used.',
		LEWDCARIO_AVATAR_COUNTER: 'Total number of avatar changes from Lewdcario.',
	},
};
