/* eslint-disable n/prefer-global/process */
/* eslint-disable no-restricted-globals */
import { redirect } from "next/navigation";
import { LoginButton } from "~/components/LoginButton";
import { pocketbase } from "~/util/pocketbase";

export default async function Page() {
	if (!pocketbase) {
		redirect("/");
	}

	const authMethods = await pocketbase.collection("users").listAuthMethods();

	return (
		<div className="mx-auto block p-16">
			{authMethods.authProviders.map((provider) => (
				<LoginButton
					href={`https://discord.com/api/oauth2/authorize?client_id=474807795183648809&code_challenge=${
						provider.codeChallenge
					}&code_challenge_method=${
						provider.codeChallengeMethod
					}&response_type=code&scope=identify%20email%20connections%20guilds&state=${
						provider.state
					}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_AUTH_DISCORD_REDIRECT_URL!)}`}
					key={provider.name}
					provider={provider}
				>
					Login with Discord
				</LoginButton>
			))}
		</div>
	);
}
