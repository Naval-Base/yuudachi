import process from "node:process";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserDisplay } from "~/components/UserDisplay";

export default async function Page({ params }: { params: { id: string } }) {
	const cookieStore = cookies();

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

	// const userData = await fetch("https://discord.com/api/v10/users/@me", {
	// 	headers: {
	// 		Authorization: `Bearer ${token.value}`,
	// 	},
	// 	next: { revalidate: 86_400 },
	// });

	// if (userData.status !== 200) {
	// 	return redirect("/api/discord/logout");
	// }

	// const user = await userData.json();

	const memberData = await fetch(`https://discord.com/api/v10/users/@me/guilds/222078108977594368/member`, {
		headers: {
			Authorization: `Bearer ${token.value}`,
		},
		next: { revalidate: 86_400 },
	});

	if (memberData.status !== 200) {
		return redirect("/api/discord/logout");
	}

	const member = await memberData.json();

	if (!member.roles.includes(process.env.DISCORD_STAFF_ROLE_ID)) {
		return <div className="mx-auto max-w-5xl gap-2 p-8">Nah, surely not.</div>;
	}

	const caseData = await fetch(`https://bot.yuudachi.dev/api/cases/${params.id}`, {
		headers: {
			Authorization: `Bearer ${process.env.JWT_TOKEN}`,
		},
	});

	const { user, cases } = await caseData.json();

	return (
		<div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 pb-8 md:flex-row md:gap-8">
			<div className="from-dark-800 from-82% md:bg-dark-800 sticky top-0 w-full place-self-center bg-gradient-to-b py-8 md:w-auto md:place-self-start">
				<UserDisplay user={user} />
			</div>

			<div className="flex w-full flex-col gap-4 md:pt-8">
				{cases.map((case_: any) => (
					<div key={case_.case_id} className="bg-dark-400 rounded-lg p-4">
						<div>Case: {case_.case_id}</div>
						<div>Reason: {case_.reason}</div>
					</div>
				))}
			</div>
		</div>
	);
}
