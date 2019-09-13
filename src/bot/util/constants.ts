import { stripIndents } from 'common-tags';
import { User } from 'discord.js';

export enum SETTINGS {
	CASES = 'caseTotal',
	MOD_ROLE = 'modRole',
	MOD_LOG = 'modLogChannel',
	MUTE_ROLE = 'muteRole',
	GITHUB_REPO = 'githubRepository',
	RESTRICT_ROLES = 'restrictRoles'
}

export const MESSAGES = {
	COMMAND_HANDLER: {
		PROMPT: {
			MODIFY_START: (str: string) => `${str}\n\nType \`cancel\` to cancel the command.`,
			MODIFY_RETRY: (str: string) => `${str}\n\nType \`cancel\` to cancel the command.`,
			TIMEOUT: 'Guess you took too long, the command has been cancelled.',
			ENDED: 'More than 3 tries and you still didn\'t quite get it. The command has been cancelled.',
			CANCEL: 'The command has been cancelled.'
		},
		LOADED: 'Command handler loaded'
	},
	INHIBITOR_HANDLER: {
		LOADED: 'Inhibitor handler loaded'
	},
	LISTENER_HANDLER: {
		LOADED: 'Listener handler loaded'
	},
	DATABASE: {
		LOADED: (db: string) => `Connected to database ${db}`
	},
	IPC: {
		ERROR: (client: string, error: Error) => `${client} ${error}`,
		OPEN: 'Server ready',
		CLOSE: 'Server destroyed',
		CONNECT: (client: string) => `${client} connected`,
		DISCONNECT: (client: string) => `${client}, disconnected`
	},
	SETTINGS: {
		INIT: 'Bot settings initialized'
	},
	CASE_HANDLER: {
		INIT: 'Case handler initialized'
	},
	MUTE_SCHEDULER: {
		INIT: 'Mute scheduler initialized'
	},
	REMIND_SCHEDULER: {
		INIT: 'Remind scheduler initialized'
	},

	COMMANDS: {
		CONFIG: {
			CLEAR: {
				DESCRIPTION: 'Clears the guild config.',
				REPLY: 'cleared the guild config.'
			},
			DELETE: {
				DESCRIPTION: 'Deletes a value to the config.',
				REPLY: (prefix: string | string[] | Promise<string | string[]>) => stripIndents`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help config\` for more information.
				`,

				CASES: {
					DESCRIPTION: 'Deletes the case number of the guild.',
					REPLY: 'deleted cases.'
				},
				MOD: {
					DESCRIPTION: 'Deletes the mod role.',
					REPLY: 'deleted moderation role.'
				},
				MOD_LOG: {
					DESCRIPTION: 'Deletes the mod log.',
					REPLY: 'deleted moderation log channel.'
				},
				MUTE: {
					DESCRIPTION: 'Deletes the mute role of the guild.',
					REPLY: 'deleted mute role.'
				},
				REPO: {
					DESCRIPTION: 'Deletes the repository the GitHub commands use.',
					REPLY: 'deleted repository.'
				},
				RESTRICT: {
					DESCRIPTION: 'Deletes the restriction roles of the guild.',
					REPLY: 'deleted restricted roles.'
				}
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
							RETRY: (author: User | null) => `${author}, please mention a proper role to be the embed restricted role.`
						},
						REPLY: (role: string) => `set restricted role for embeds to **${role}**`
					},
					EMOJI: {
						DESCRIPTION: 'Sets the restriction role for emojis of the guild.',
						PROMPT: {
							START: (author: User | null) => `${author}, what role should act as the emoji restricted role?`,
							RETRY: (author: User | null) => `${author}, please mention a proper role to be the emoji restricted role.`
						},
						REPLY: (role: string) => `set restricted role for emojis to **${role}**`
					},
					REACTION: {
						DESCRIPTION: 'Sets the restriction role for reactions of the guild.',
						PROMPT: {
							START: (author: User | null) => `${author}, what role should act as the reaction restricted role?`,
							RETRY: (author: User | null) => `${author}, please mention a proper role to be the reaction restricted role.`
						},
						REPLY: (role: string) => `set restricted role for reactions to **${role}**`
					},
					TAG: {
						DESCRIPTION: 'Sets the restriction role for tags of the guild.',
						PROMPT: {
							START: (author: User | null) => `${author}, what role should act as the tag restricted role?`,
							RETRY: (author: User | null) => `${author}, please mention a proper role to be the tag restricted role.`
						},
						REPLY: (role: string) => `set restricted role for tags to **${role}**`
					}
				},
				CASES: {
					DESCRIPTION: 'Sets the case number of the guild.',
					REPLY: (cases: number) => `set cases to **${cases}**`
				},
				MOD: {
					DESCRIPTION: 'Sets the mod role many of the commands use for permission checking.',
					REPLY: (role: string) => `set moderation role to **${role}**`
				},
				MOD_LOG: {
					DESCRIPTION: 'Sets the mod log many of the commands use to log moderation actions.',
					REPLY: (channel: string) => `set moderation log channel to **${channel}**`
				},
				MUTE: {
					DESCRIPTION: 'Sets the mute role of the guild.',
					REPLY: (role: string) => `set mute role to **${role}**`
				},
				REPO: {
					DESCRIPTION: 'Sets the repository the GitHub commands use.',
					REPLY: (repo: string) => `set repository to **${repo}**`
				}
			}
		}
	}
};

export const PROMETHEUS = {
	MESSAGE_COUNTER: 'yukikaze_messages_total',
	COMMAND_COUNTER: 'yukikaze_commands_total',
	LEWDCARIO_AVATAR_COUNTER: 'yukikaze_lewdcario_avatar_total',

	HELP: {
		MESSAGE_COUNTER: 'Total number of messages Yukikaze has seen.',
		COMMAND_COUNTER: 'Total number of commands used.',
		LEWDCARIO_AVATAR_COUNTER: 'Total number of avatar changes from Lewdcario.'
	}
};
