import process from "node:process";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserDisplay } from "~/components/UserDisplay";

export default async function Page() {
	const cookieStore = cookies();

	const token = cookieStore.get("discord_token");
	if (!token) {
		return (
			<a
				href={`https://discord.com/api/oauth2/authorize?client_id=${
					process.env.DISCORD_CLIENT_ID
				}&redirect_uri=${encodeURIComponent(
					process.env.DISCORD_REDIRECT_URI!,
				)}&response_type=code&scope=identify%20email%20guilds.join%20guilds`}
			>
				Login with Discord
			</a>
		);
	}

	const userData = await fetch("https://discord.com/api/v10/users/@me", {
		headers: {
			Authorization: `Bearer ${token.value}`,
		},
	});

	if (userData.status !== 200) {
		return redirect("/api/discord/logout");
	}

	const user = await userData.json();

	return <UserDisplay user={user} />;
}
