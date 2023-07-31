"use client";

import type { AuthProviderInfo } from "pocketbase";
import type { PropsWithChildren } from "react";
import { useLocalStorage } from "react-use";

export function LoginButton({
	href,
	provider,
	children,
}: PropsWithChildren<{ readonly href?: string | undefined; readonly provider?: AuthProviderInfo | undefined }>) {
	const [_, setValue] = useLocalStorage<AuthProviderInfo>("provider");

	return (
		<a href={href} onClick={() => setValue(provider)}>
			{children}
		</a>
	);
}
