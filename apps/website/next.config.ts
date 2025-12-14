import type { NextConfig } from "next";

const { REPORT_URL } = process.env;

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
	async rewrites() {
		return [
			{
				source: "/:path*",
				destination: `/:path*`,
			},
			{
				source: "/report",
				destination: `${REPORT_URL}/report`,
			},
			{
				source: "/report/:path*",
				destination: `${REPORT_URL}/report/:path*`,
			},
		];
	},
} satisfies NextConfig;
