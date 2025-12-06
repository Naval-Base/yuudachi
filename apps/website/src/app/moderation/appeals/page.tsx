import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Table } from "@/components/Table";
import { columns } from "@/components/Table/AppealsColumns";

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
				)}&response_type=code&scope=identify%20guilds.members.read%20guilds.join%20guilds`}
			>
				Login with Discord
			</a>
		);
	}

	const memberData = await fetch(`https://discord.com/api/v10/users/@me/guilds/222078108977594368/member`, {
		headers: {
			Authorization: `Bearer ${token.value}`,
		},
		next: { revalidate: 3_600 },
	});

	if (memberData.status !== 200) {
		return redirect("/api/discord/logout");
	}

	const member = await memberData.json();

	if (!member.roles.includes(process.env.DISCORD_STAFF_ROLE_ID)) {
		return <div className="mx-auto max-w-5xl gap-2 p-8">Nah, surely not.</div>;
	}

	const appealsData = await fetch(`https://bot.yuudachi.dev/api/appeals`, {
		headers: {
			Authorization: `Bearer ${process.env.JWT_TOKEN}`,
		},
	});

	const { appeals } = await appealsData.json();

	return (
		<div className="flex flex-col gap-8">
			<h1 className="mb-4 pt-12 text-center text-4xl leading-none font-extrabold tracking-tight md:mb-8 md:text-5xl">
				Latest <span className="decoration-blurple underline decoration-8 underline-offset-3">appeals</span>
			</h1>
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-8 md:max-w-4xl md:flex-row md:gap-8">
				<div className="flex w-full flex-col gap-4">
					<div className="flex flex-col gap-4">
						{appeals.length ? (
							<Table columns={columns} data={appeals} />
						) : (
							<h2 className="pt-4 text-center text-lg font-semibold">No appeals</h2>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
