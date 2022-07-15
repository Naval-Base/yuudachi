const badUsernamesRegex = [
	{
		name: 'Discord_HypeSquad',
		regex: /discord\s+hype\s*squad/i,
	},
	{
		name: 'Discord_Events_Academy',
		regex: /(hype\s*squad|discord)\s+(events?|academy|team|mail)/i,
	},
	{
		name: 'Discord_Developers',
		regex: /discord\s+(developers?|api|bots?|message)?/i,
	},
	{
		name: 'Discord_Moderators',
		regex: /^discord\s+moderators?$/i,
	},
	{
		name: 'Academy_Staff',
		regex: /^academy\s+(staff|moderator)s?/i,
	},
	{
		name: 'Mod_Developers_Academy',
		regex: /(mod(erator)?('?s)?|hype\s*squad|developers?)\s+(academy|message|exam|team|events?)/i,
	},
	{
		name: 'Contact_Hype',
		regex: /contact\s*(hype|events?)/i,
	},
	{
		name: 'HypeSquad_Events',
		regex: /(hype)\s+(events?|messages?|apply|team)/i,
	},
];

interface BadUsernameHit {
	name: string;
	regex: RegExp;
}

export function checkUsername(username: string): BadUsernameHit | null {
	for (const regexEntry of badUsernamesRegex) {
		if (regexEntry.regex.test(username)) {
			return {
				name: regexEntry.name,
				regex: regexEntry.regex,
			};
		}
	}

	return null;
}
