import { GuildMember } from "discord.js";

type NestedMember = {
	member?: GuildMember;
};

type FindArgsOptions = {
	[key: string]:
		| NestedMember
		| {
				user: NestedMember;
		  };
	user: NestedMember;
};

export function findMemberInArgs(args: FindArgsOptions): GuildMember | null {
	if (args?.user?.member instanceof GuildMember) {
		return args.user.member ?? null;
	}

	for (const key of Object.keys(args)) {
		const member = (args[key as keyof typeof args] as FindArgsOptions).user?.member;
		if (member instanceof GuildMember) return member;
	}

	return null;
}
