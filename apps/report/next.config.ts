import type { NextConfig } from "next";

export default {
	reactStrictMode: true,
	output: "standalone",
	images: {
		dangerouslyAllowSVG: true,
		contentDispositionType: "attachment",
		contentSecurityPolicy: "default-src 'self'; frame-src 'none'; sandbox;",
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
			},
		],
	},
	poweredByHeader: false,
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	reactCompiler: true,
	typescript: {
		ignoreBuildErrors: true,
	},
} satisfies NextConfig;
