import process from "node:process";

const { REPORT_URL } = process.env;

/**
 * @type {import('next').NextConfig}
 */
export default {
	reactStrictMode: true,
	swcMinify: true,
	eslint: {
		ignoreDuringBuilds: true,
	},
	cleanDistDir: true,
	experimental: {
		images: {
			allowFutureImage: true,
		},
	},
	images: {
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
};
