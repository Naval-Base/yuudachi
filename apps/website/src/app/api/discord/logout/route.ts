import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const cookieStore = await cookies();
	cookieStore.delete("discord_token");

	return NextResponse.redirect(
		new URL("/", process.env.NODE_ENV === "development" ? `http://${req.headers.get("host")}` : req.url),
	);
}
