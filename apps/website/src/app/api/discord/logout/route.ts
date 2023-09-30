import process from "node:process";
import { URL } from "node:url";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	cookies().delete("discord_token");

	return NextResponse.redirect(
		new URL("/appeals", process.env.NODE_ENV === "development" ? `https://${req.headers.get("host")}` : req.url),
	);
}
