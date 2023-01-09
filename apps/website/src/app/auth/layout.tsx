import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { getUserFromCookie } from "~/util/getUserFromCookie";

export default async function AuthLayout({ children }: PropsWithChildren) {
	const user = getUserFromCookie(cookies());

	if (user) {
		redirect("/");
	}

	return children;
}
