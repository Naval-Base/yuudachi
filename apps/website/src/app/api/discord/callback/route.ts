import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const cookieStore = cookies();

	const params = new URLSearchParams();
	params.append("client_id", process.env.DISCORD_CLIENT_ID!);
	params.append("client_secret", process.env.DISCORD_CLIENT_SECRET!);
	params.append("grant_type", "authorization_code");
	params.append("code", searchParams.get("code")!);
	params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI!);

	const data = await fetch("https://discord.com/api/v10/oauth2/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params,
	});
	const json = await data.json();

	cookieStore.set("discord_token", json.access_token, {
		maxAge: json.expires_in,
		path: "/",
		httpOnly: true,
		secure: true,
	});

	return NextResponse.redirect(
		new URL("/", process.env.NODE_ENV === "development" ? `https://${req.headers.get("host")}` : req.url),
	);
}
