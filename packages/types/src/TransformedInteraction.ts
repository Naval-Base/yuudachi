import {
	AntiRaidNukeCommand,
	BanCommand,
	DebugCommand,
	DurationCommand,
	HistoryCommand,
	KickCommand,
	LockdownCommand,
	PingCommand,
	ReasonCommand,
	ReferenceCommand,
	RestrictCommand,
	SoftbanCommand,
	UnbanCommand,
	WarnCommand,
} from './Commands';

export interface TransformedInteraction {
	debug: DebugCommand;
	'anti-raid-nuke': AntiRaidNukeCommand;
	ban: BanCommand;
	duration: DurationCommand;
	history: HistoryCommand;
	kick: KickCommand;
	lockdown: LockdownCommand;
	reason: ReasonCommand;
	reference: ReferenceCommand;
	restrict: RestrictCommand;
	softban: SoftbanCommand;
	unban: UnbanCommand;
	warn: WarnCommand;
	ping: PingCommand;
}
