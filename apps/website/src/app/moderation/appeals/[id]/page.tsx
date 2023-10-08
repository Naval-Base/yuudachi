import process from "node:process";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CaseCard } from "~/components/CaseCard";
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

	const caseData = await fetch(`https://bot.yuudachi.dev/api/appeals/${params.id}`, {
		headers: {
			Authorization: `Bearer ${process.env.JWT_TOKEN}`,
		},
	});

	const { user, appeal } = await caseData.json();

	if (!user) {
		return <div className="mx-auto max-w-5xl gap-2 p-8 font-medium">No user found.</div>;
	}

	return (
		<div className="flex flex-col gap-8">
			<h1 className="mb-4 pt-12 text-center text-4xl font-extrabold leading-none tracking-tight md:mb-8 md:text-5xl">
				Review <span className="underline-offset-3 decoration-blurple underline decoration-8">cases</span>
			</h1>
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-8 md:max-w-4xl md:flex-row md:gap-8">
				<div className="dark:from-dark-600 from-light-600 sticky top-0 flex w-full flex-col place-content-start gap-4 bg-gradient-to-b from-85% dark:from-85% md:w-auto">
					<UserDisplay className="sticky top-0 py-4" user={user} />
				</div>

				<div className="flex w-full flex-col gap-4">
					<div className="flex flex-col gap-4">
						<h2 className="text-lg font-semibold">Appeal #{appeal.appeal_id}</h2>
						<CaseCard case_={appeal} />
					</div>
				</div>
			</div>
		</div>
	);
}
