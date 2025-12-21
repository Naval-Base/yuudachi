import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// import { GuildsGrid } from "./GuildsGrid";
import { GuildsTable } from "./GuildsTable";

export default async function Page() {
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

	const botGuildsData = await fetch(`${process.env.BOT_API_URL}/api/guilds`, {
		headers: {
			Authorization: `Bearer ${process.env.JWT_TOKEN}`,
		},
	});

	const botGuilds = await botGuildsData.json();

	const resolvedGuilds = guilds.filter((guild: any) =>
		botGuilds?.some((botGuild: any) => botGuild.guild_id === guild.id),
	);

	return (
		<div className="flex flex-col gap-8">
			<h1 className="p-6 text-center text-4xl leading-none font-extrabold tracking-tight md:text-5xl">
				Your <span className="decoration-blurple underline decoration-8 underline-offset-3">guilds</span>
			</h1>
			<div className="mx-auto flex w-full flex-col gap-8 px-4 pb-8">
				<div className="flex w-full flex-col gap-4">
					<div className="flex flex-col gap-4">
						{resolvedGuilds.length ? (
							<GuildsTable items={resolvedGuilds} />
						) : (
							<h2 className="pt-4 text-center text-lg font-semibold">No guilds</h2>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
