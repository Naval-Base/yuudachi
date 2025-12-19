import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function Page({ params }: { readonly params: Promise<{ id: string }> }) {
	const { id } = await params;
	const cookieStore = await cookies();

	const token = cookieStore.get("discord_token");
	if (!token) {
		return (
			<a
				href={`https://discord.com/api/oauth2/authorize?client_id=${
					process.env.DISCORD_CLIENT_ID
				}&redirect_uri=${encodeURIComponent(
					process.env.DISCORD_REDIRECT_URI!,
				)}&response_type=code&scope=identify%20guilds.members.read%20guilds.join%20guilds`}
			>
				Login with Discord
			</a>
		);
	}

	const guildsData = await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
		headers: {
			Authorization: `Bearer ${token.value}`,
		},
		next: { revalidate: 3_600 },
	});

	if (guildsData.status !== 200) {
		return redirect("/api/discord/logout");
	}

	const guilds = await guildsData.json();
	const guild = guilds.find((guild: any) => guild.id === id);

	if (!guild) {
		return notFound();
	}

	const memberData = await fetch(`https://discord.com/api/v10/users/@me/guilds/${id}/member`, {
		headers: {
			Authorization: `Bearer ${token.value}`,
		},
		next: { revalidate: 3_600 },
	});

	if (memberData.status !== 200) {
		return redirect("/api/discord/logout");
	}

	const member = await memberData.json();

	const guildSettingsData = await fetch(`${process.env.BOT_API_URL}/api/guilds/${id}/settings`, {
		headers: {
			Authorization: `Bearer ${process.env.JWT_TOKEN}`,
		},
	});

	const guildSettings = await guildSettingsData.json();

	if (!member.roles.includes(guildSettings.mod_role_id)) {
		return <div className="mx-auto max-w-5xl gap-2 p-8">Nah, surely not.</div>;
	}

	return (
		<div className="flex flex-col gap-8">
			<h1 className="mb-4 pt-12 text-center text-4xl leading-none font-extrabold tracking-tight md:mb-8 md:text-5xl">
				<span className="decoration-blurple underline decoration-8 underline-offset-3">{guild.name}</span>
			</h1>
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-8 md:max-w-4xl md:flex-row md:gap-8">
				<div className="flex w-full flex-col gap-4" />
			</div>
		</div>
	);
}
