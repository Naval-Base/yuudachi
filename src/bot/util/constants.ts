import { stripIndents } from 'common-tags';
import { User } from 'discord.js';
import { Reminder } from '../models/Reminders';

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
	BLACKLIST = 'blacklist',
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
		INFO: {
			CHANNEL: {
				DESCRIPTION: 'Get information about a channel.',
			},
			EMOJI: {
				DESCRIPTION: 'Get information about an emoji.',
				PROMPT: {
					START: (author: User | null) => `${author}, what emoji would you like information about?`,
					RETRY: (author: User | null) => `${author}, please provide a valid emoji!`,
				},
			},
			ROLE: {
				DESCRIPTION: 'Get information about a role.',
			},
			SERVER: {
				DESCRIPTION: 'Get information on the server.',
			},
			USER: {
				DESCRIPTION: 'Get information about a member.',
			},
		},
		MOD: {
			CASES: {
				DESCRIPTION: stripIndents`Available methods:
					 • show \`<number>\`
					 • delete \`<number>\`

					Required: \`<>\` | Optional: \`[]\`
				`,
				REPLY: (prefix: string | string[] | Promise<string | string[]>) => stripIndents`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help cases\` for more information.
				`,

				DELETE: {
					DESCRIPTION: 'Delete a case from the database.',
					PROMPT: {
						START: (author: User | null) => `${author}, what case do you want to delete?`,
						RETRY: (author: User | null) => `${author}, please enter a case number.`,
					},
					NO_CASE_NUMBER: 'at least provide me with a correct number.',
					NO_CASE:
						"I looked where I could, but I couldn't find a case with that Id, maybe look for something that actually exists next time!",
					DELETE: 'You sure you want me to delete this case?',
					DELETING: (id: number) => `Deleting **${id}**...`,
					TIMEOUT: 'timed out. Cancelled delete.',
					CANCEL: 'cancelled delete.',
					REPLY: (id: number) => `Successfully deleted case **${id}**`,
				},
				SHOW: {
					DESCRIPTION: 'Inspect a case, pulled from the database.',
					PROMPT: {
						START: (author: User | null) => `${author}, what case do you want to look up?`,
						RETRY: (author: User | null) => `${author}, please enter a case number.`,
					},
					NO_CASE_NUMBER: 'at least provide me with a correct number.',
					NO_CASE:
						"I looked where I could, but I couldn't find a case with that Id, maybe look for something that actually exists next time!",
				},
			},
			RESTRICTIONS: {
				DESCRIPTION: stripIndents`
					Restrict a members ability to post embeds/use custom emojis/react.

					Available restrictions:
					 • embed \`<member> [--ref=number] [...reason]\`
					 • emoji \`<member> [--ref=number] [...reason]\`
					 • reaction \`<member> [--ref=number] [...reason]\`
					 • tag \`<member> [--ref=number] [...reason]\`

					Required: \`<>\` | Optional: \`[]\`

					For additional \`<...arguments>\` usage refer to the examples below.
				`,
				REPLY: (prefix: string | string[] | Promise<string | string[]>) => stripIndents`
					When you beg me so much I just can't not help you~
					Check \`${prefix}help restrict\` for more information.
				`,

				EMBED: {
					DESCRIPTION: 'Restrict a members ability to post embeds/upload files.',
					PROMPT: {
						START: (author: User | null) => `${author}, what member do you want to restrict?`,
						RETRY: (author: User | null) => `${author}, please mention a member.`,
					},
				},
				EMOJI: {
					DESCRIPTION: 'Restrict a members ability to use custom emoji.',
					PROMPT: {
						START: (author: User | null) => `${author}, what member do you want to restrict?`,
						RETRY: (author: User | null) => `${author}, please mention a member.`,
					},
				},
				REACTION: {
					DESCRIPTION: 'Restrict a members ability to use reactions.',
					PROMPT: {
						START: (author: User | null) => `${author}, what member do you want to restrict?`,
						RETRY: (author: User | null) => `${author}, please mention a member.`,
					},
				},
				TAG: {
					DESCRIPTION: 'Restrict a members ability to create/edit/delete/download/list/search tags.',
					PROMPT: {
						START: (author: User | null) => `${author}, what member do you want to restrict?`,
						RETRY: (author: User | null) => `${author}, please mention a member.`,
					},
				},
			},
			BAN: {
				DESCRIPTION: 'Bans a member, duh.',
				PROMPT: {
					START: (author: User | null) => `${author}, what member do you want to ban?`,
					RETRY: (author: User | null) => `${author}, please mention a member.`,
				},
			},
			DURATION: {
				DESCRIPTION: 'Sets the duration for a mute and reschedules it.',
				PROMPT: {
					START: (author: User | null) => `${author}, what case do you want to add a duration to?`,
					RETRY: (author: User | null) => `${author}, please enter a case number.`,
				},
				PROMPT_2: {
					START: (author: User | null) => `${author}, for how long do you want the mute to last?`,
					RETRY: (author: User | null) => `${author}, please use a proper time format.`,
				},
				NO_CASE_NUMBER: 'at least provide me with a correct number.',
				NO_CASE:
					"I looked where I could, but I couldn't find a case with that Id, maybe look for something that actually exists next time!",
				WRONG_MOD: "you'd be wrong in thinking I would let you fiddle with other peoples achievements!",
				NO_MESSAGE: "looks like the message doesn't exist anymore!",
				REPLY: (id: number) => `Successfully updated duration for case **#${id}**`,
			},
			HISTORY: {
				DESCRIPTION: 'Check the history of a member.',
				NO_PERMISSION: 'you know, I know, we should just leave it at that.',
			},
			KICK: {
				DESCRIPTION: 'Kicks a member, duh.',
				PROMPT: {
					START: (author: User | null) => `${author}, what member do you want to kick?`,
					RETRY: (author: User | null) => `${author}, please mention a member.`,
				},
			},
			MUTE: {
				DESCRIPTION: 'Mutes a member, duh.',
				PROMPT: {
					START: (author: User | null) => `${author}, what member do you want to mute?`,
					RETRY: (author: User | null) => `${author}, please mention a member.`,
				},
				PROMPT_2: {
					START: (author: User | null) => `${author}, for how long do you want the mute to last?`,
					RETRY: (author: User | null) => `${author}, please use a proper time format.`,
				},
			},
			REASON: {
				DESCRIPTION: 'Sets/Updates the reason of a modlog entry.',
				PROMPT: {
					START: (author: User | null) => `${author}, what case do you want to add a reason to?`,
					RETRY: (author: User | null) => `${author}, please enter a case number.`,
				},
				NO_CASE_NUMBER: 'at least provide me with a correct number.',
				NO_CASE:
					"I looked where I could, but I couldn't find a case with that Id, maybe look for something that actually exists next time!",
				WRONG_MOD: "you'd be wrong in thinking I would let you fiddle with other peoples achievements!",
				NO_MESSAGE: "looks like the message doesn't exist anymore!",
				REPLY: (id: number) => `Successfully set reason for case **#${id}**`,
			},
			SOFTBAN: {
				DESCRIPTION: 'Softbans a member, duh.',
				PROMPT: {
					START: (author: User | null) => `${author}, what member do you want to softban?`,
					RETRY: (author: User | null) => `${author}, please mention a member.`,
				},
			},
			UNBAN: {
				DESCRIPTION: 'Unbans a user, duh.',
				PROMPT: {
					START: (author: User | null) => `${author}, what member do you want to unban?`,
					RETRY: (author: User | null) => `${author}, please mention a member.`,
				},
			},
			WARN: {
				DESCRIPTION: 'Warns a user, duh.',
				PROMPT: {
					START: (author: User | null) => `${author}, what member do you want to warn?`,
					RETRY: (author: User | null) => `${author}, please mention a member.`,
				},
			},
		},
		REMINDERS: {
			DESCRIPTION: stripIndents`Available methods:
				 • add \`[--hoist/--pin] <tag> <content>\`
				 • del \`[--all]\`
				 • list

				Required: \`<>\` | Optional: \`[]\`

				For additional \`<...arguments>\` usage refer to the examples below.
			`,
			REPLY: (prefix: string | string[] | Promise<string | string[]>) => stripIndents`
				When you beg me so much I just can't not help you~
				Check \`${prefix}help reminder\` for more information.
			`,

			ADD: {
				DESCRIPTION: 'Adds a reminder that triggers at the given time and tells you the given reason.',
				PROMPT: {
					START: (author: User | null) => `${author}, when do you want me to remind you?`,
					RETRY: (author: User | null) => `${author}, please use a proper time format.`,
				},
				PROMPT_2: {
					START: (author: User | null) => `${author}, what do you want me to remind you of?`,
				},
				REMINDER_LIMIT: (limit: number) => `you already have ${limit} ongoing reminders... do you really need more?`,
				CHARACTER_LIMIT:
					'you must still have water behind your ears to not realize that messages have a limit of 2000 characters!',
				INVALID_TIME_1: "I can't tell what time I'm supposed to remind you at!",
				INVALID_TIME_2: "sorry, I don't have access to time travel yet!",
				INVALID_TIME_3: "I'm sure you have better memory than that.",
				REPLY: (time: number) => `I'll remind you in ${time}`,
			},
			DELETE: {
				DESCRIPTION: 'Deletes/cancels an ongoing reminder.',
				NO_REMINDERS: 'you have no ongoing reminders!',
				AWAIT_MESSAGE: "Send a message with the reminder's number to delete it or `cancel` to cancel",
				TIME_LIMIT: "Looks like you've run out of time!",
				CANCEL: "Looks like we're all done here!",
				REPLY: (reminders: Reminder[]) => `I deleted ${reminders.length} reminder${reminders.length === 1 ? '' : 's'}!`,
				REPLY_2: 'Welp, looks like all of your reminders are gone!',
			},
		},
		TAGS: {},
		UTIL: {
			BLACKLIST: {
				DESCRIPTION: 'Prohibit/Allow a user from using Yukikaze.',
				PROMPT: {
					START: (author: User | null) => `${author}, who would you like to blacklist/unblacklist?`,
				},
				REPLY: (user: string) => `${user}, have you realized Yukikaze's greatness? You've got good eyes~`,
				REPLY_2: (user: string) => `${user}, you are not worthy of Yukikaze's luck~`,
			},
			CYBERNUKE: {
				DESCRIPTION: 'Bans all members that have joined recently, with new accounts.',
				PROMPT: {
					START: (author: User | null) =>
						`${author}, how old (in minutes) should a member be for the cybernuke to ignore them (server join date)?`,
					RETRY: (author: User | null) => `${author}, the minimum is \`0.1\` and the maximum \`120\` minutes.`,
				},
				PROMPT_2: {
					START: (author: User | null) =>
						`${author}, how old (in minutes) should a member's account be for the cybernuke to ignore them (account age)?`,
					RETRY: (author: User | null) => `${author}, the minimum is \`0.1\` minutes.`,
				},
			},
			EVAL: {
				DESCRIPTION: "You can't use this anyway, so why explain.",
				PROMPT: {
					START: (author: User | null) => `${author}, what would you like to evaluate?`,
				},
			},
			HELP: {
				DESCRIPTION: 'Displays a list of available commands, or detailed information for a specified command.',
				REPLY: (prefix: string | string[] | Promise<string | string[]>) => stripIndents`A list of available commands.
					For additional info on a command, type \`${prefix}help <command>\`
				`,
			},
			PING: {
				DESCRIPTION: "Checks the bot's ping to the Discord servers.",
				RESPONSES: [
					'No.',
					'Not happening.',
					'Maybe later.',
					stripIndents`:ping_pong: Pong! \`$(ping)ms\`
						Heartbeat: \`$(heartbeat)ms\``,
					stripIndents`Just so you know, I'm not doing this for fun! \`$(ping)ms\`
						Doki doki: \`$(heartbeat)ms\``,
					stripIndents`Don't think this means anything special! \`$(ping)ms\`
						Heartbeat: \`$(heartbeat)ms\``,
					stripIndents`Can we get on with this already?! \`$(ping)ms\`
						Heartbeat: \`$(heartbeat)ms\``,
				],
			},
			PREFIX: {
				DESCRIPTION: 'Displays or changes the prefix of the guild.',
				REPLY: (prefix: string | string[] | Promise<string | string[]>) =>
					`The current prefix for this guild is: \`${prefix}\``,
				REPLY_2: (prefix: string) => `the prefix has been reset to \`${prefix}\``,
				REPLY_3: (prefix: string) => `the prefix has been set to \`${prefix}\``,
			},
			STATS: {
				DESCRIPTION: 'Displays statistics about the bot.',
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
