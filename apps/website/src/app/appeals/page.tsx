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

	// const caseData = await fetch("https://bot.yuudachi.dev/api/cases");

	// const cases = await caseData.json();

	// const targetData = await fetch("https://bot.yuudachi.dev/api/users/492374435274162177");

	// const target = await targetData.json();

	return (
		<div className="flex gap-4">
			<div className="p-4">
				<div>
					You:
					<UserDisplay user={user} />
				</div>

				{/* <div>
					Target:
					<UserDisplay user={target} />
				</div> */}
			</div>

			{/* <div className="w-full p-4">
				<table>
					<thead>
						<tr>
							<th className="border px-4 py-1 text-left">Case id</th>
							<th className="border px-4 py-1 text-left">Reason</th>
						</tr>
					</thead>
					<tbody>
						{cases.map((c: any) => (
							<tr key={c.case_id}>
								<td className="border px-4 py-1">{c.case_id}</td>
								<td className="border px-4 py-1">{c.reason}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div> */}
		</div>
	);
}
