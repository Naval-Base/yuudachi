import { stripIndents } from 'common-tags';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Formatters, GuildMember } from 'discord.js';
import i18next from 'i18next';

dayjs.extend(relativeTime);

import { MAX_TRUST_ACCOUNT_AGE } from '../Constants';
import { addFields } from './embed';

function colorFromDuration(duration: number) {
	const percent = Math.min(duration / (MAX_TRUST_ACCOUNT_AGE / 100), 100);
	let r;
	let g;
	let b = 0;

	if (percent < 50) {
		r = 255;
		g = Math.round(5.1 * percent);
	} else {
		g = 255;
		r = Math.round(510 - 5.1 * percent);
	}

	const tintFactor = 0.3;

	r += (255 - r) * tintFactor;
	g += (255 - g) * tintFactor;
	b += (255 - b) * tintFactor;

	return (r << 16) + (g << 8) + b;
}

export function generateMemberLog(member: GuildMember, join = true) {
	const sinceCreationFormatted = Formatters.time(
		dayjs(member.user.createdTimestamp).unix(),
		Formatters.TimestampStyles.RelativeTime,
	);
	const creationFormatted = Formatters.time(
		dayjs(member.user.createdTimestamp).unix(),
		Formatters.TimestampStyles.ShortDateTime,
	);

	let description = stripIndents`
		• Username: ${member.user.toString()} - \`${member.user.tag}\` (${member.user.id})
		• Created: ${creationFormatted} (${sinceCreationFormatted})
	`;

	if (member.joinedTimestamp) {
		const sinceJoinFormatted = Formatters.time(
			dayjs(member.joinedTimestamp).unix(),
			Formatters.TimestampStyles.RelativeTime,
		);
		const joinFormatted = Formatters.time(
			dayjs(member.joinedTimestamp).unix(),
			Formatters.TimestampStyles.ShortDateTime,
		);

		description += `\n• Joined: ${joinFormatted} (${sinceJoinFormatted})`;
	}

	if (!join) {
		const sinceleaveFormatted = Formatters.time(dayjs().unix(), Formatters.TimestampStyles.RelativeTime);
		const leaveFormatted = Formatters.time(dayjs().unix(), Formatters.TimestampStyles.ShortDateTime);

		description += `\n• Left: ${leaveFormatted} (${sinceleaveFormatted})`;
	}

	const embed = addFields({
		author: {
			name: `${member.user.tag} (${member.user.id})`,
			icon_url: member.user.displayAvatarURL(),
		},
		color: join ? colorFromDuration(Date.now() - member.user.createdTimestamp) : 3092790,
		description: description,
		footer: {
			text: i18next.t(join ? 'memberLog.footer' : 'memberLog.footer'),
		},
		timestamp: new Date().toISOString(),
	});

	return embed;
}
