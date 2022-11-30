/* eslint-disable n/prefer-global/process */
/* eslint-disable no-restricted-globals */
"use client";

import { redirect } from "next/navigation";
import type { RecordAuthResponse, Record } from "pocketbase";
import { useEffect, useState } from "react";
import { pocketbase } from "~/util/pocketbase";

export default function Page({ searchParams }: { searchParams?: { [key: string]: string[] | string | undefined } }) {
	if (!pocketbase) {
		redirect("/");
	}

	const [auth, setAuth] = useState<RecordAuthResponse<Record> | null>(null);

	const provider = JSON.parse(localStorage.getItem("provider") ?? "");
	console.log(provider, searchParams);

	if (!provider) {
		throw new Error("Provider login info missing.");
	}

	if (provider?.state !== searchParams?.state) {
		throw new Error("State parameters don't match.");
	}

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await pocketbase
					?.collection("users")
					.authWithOAuth2(
						provider.name,
						searchParams?.code as string,
						provider.codeVerifier,
						process.env.NEXT_PUBLIC_AUTH_DISCORD_REDIRECT_URL!,
					);

				if (data) {
					setAuth(data);
				}
			} catch (error) {
				console.error(error);
			}

			localStorage.removeItem("provider");
		};

		void fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="mx-auto block p-16">
			<h1>Hooray!</h1>

			{auth ? (
				<>
					<h2>Data:</h2>
					<p>{JSON.stringify(auth, null, 2)}</p>
				</>
			) : null}
		</div>
	);
}
