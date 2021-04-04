import { APIGuildMember, APIPartialChannel, APIUser, Permissions } from 'discord-api-types/v8';

type User = APIGuildMember & { user: APIUser; permissions: Permissions };
type Channel = APIPartialChannel & { permissions: Permissions };

export interface DebugCommand {
	refresh: {
		commands: any;
	};
}

export interface AntiRaidNukeCommand {
	join: string;
	age: string;
	report: boolean;
	list: boolean;
	'no-dry-run': boolean;
	days: number;
}

export interface BanCommand {
	user: User;
	reason: string;
	days: number;
	reference: number;
	duration: string;
}

export interface DurationCommand {
	case: number;
	duration: string;
	hide: boolean;
}

export interface HistoryCommand {
	user: User;
}

export interface KickCommand {
	user: User;
	reason: string;
	reference: number;
}

export interface LockdownCommand {
	lock: {
		duration: string;
		channel: Channel;
		reason: string;
	};
	lift: {
		channel: Channel;
	};
}

export interface ReasonCommand {
	case: number;
	reason: string;
	hide: boolean;
}

export interface ReferenceCommand {
	case: number;
	reference: number;
	hide: boolean;
}

interface RestrictSubCommand {
	user: User;
	duration: string;
	reason: string;
	reference: number;
}

export interface RestrictCommand {
	mute: RestrictSubCommand;
	embed: RestrictSubCommand;
	react: RestrictSubCommand;
	emoji: RestrictSubCommand;
	tag: RestrictSubCommand;
	unrole: {
		case: number;
	};
}

export interface SoftbanCommand {
	user: User;
	reason: string;
	days: number;
	reference: number;
}

export interface UnbanCommand {
	user: User;
	reason: string;
	reference: number;
}

export interface WarnCommand {
	user: User;
	reason: string;
	reference: number;
}

export interface PingCommand {
	hide: boolean;
}
