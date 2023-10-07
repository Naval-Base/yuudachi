import process from "node:process";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CaseCard } from "~/components/CaseCard";
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
				)}&response_type=code&scope=identify%20guilds.members.read%20guilds.join%20guilds`}
			>
				Login with Discord
			</a>
		);
	}

	const userData = await fetch("https://discord.com/api/v10/users/@me", {
		headers: {
			Authorization: `Bearer ${token.value}`,
		},
		next: { revalidate: 3_600 },
	});

	if (userData.status !== 200) {
		return redirect("/api/discord/logout");
	}

	const oauth2User = await userData.json();

	const banData = await fetch(`https://bot.yuudachi.dev/api/users/${oauth2User.id}`, {
		headers: {
			Authorization: `Bearer ${process.env.JWT_TOKEN}`,
		},
	});

	const { user, banned, case: case_ } = await banData.json();

	if (!banned) {
		return <div className="mx-auto max-w-5xl gap-2 p-8 font-medium">You are not banned.</div>;
	}

	return (
		<div className="flex flex-col gap-8">
			<h1 className="mb-4 pt-12 text-center text-4xl font-extrabold leading-none tracking-tight md:mb-8 md:text-5xl">
				Appeal your <span className="underline-offset-3 decoration-blurple underline decoration-8">ban</span>
			</h1>
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-8 md:max-w-4xl md:flex-row md:gap-8">
				<div className="flex flex-col gap-8">
					<div className="dark:from-dark-600 dark:from-82% from-82% from-light-600 top-0 flex w-full flex-col place-content-start gap-4 bg-gradient-to-b md:w-auto">
						<UserDisplay user={user} />
					</div>

					<div className="flex flex-col gap-4">
						<h2 className="text-lg font-semibold">Case #{case_.case_id}</h2>
						<CaseCard case_={case_} />
					</div>
				</div>

				<div className="flex w-full grow flex-col gap-4">
					<div className="flex grow grow flex-col gap-4">
						<label className="flex grow flex-col gap-4 text-lg font-semibold">
							Why do you deserve a second chance?
							<textarea
								cols={12}
								className="dark:bg-dark-800 bg-light-400 dark:border-dark-100 focus-visible:ring-blurple dark:focus-visible:ring-offset-dark-800 h-full min-h-[150px] w-full rounded-lg border shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
							/>
						</label>

						<button
							type="button"
							className="dark:border-dark-100 bg-blurple hover:bg-blurple-300 focus-visible:ring-blurple dark:focus-visible:ring-offset-dark-800 focus-visible:ring-offset text-light-100 transform-gpu place-self-end rounded-lg border px-4 py-2 font-medium outline-none focus-visible:ring-2 active:translate-y-px"
						>
							Send
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
