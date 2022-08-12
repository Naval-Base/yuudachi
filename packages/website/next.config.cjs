/**
 * @type {import('next').NextConfig}
 */
module.exports = {
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
	// eslint-disable-next-line @typescript-eslint/require-await
	async rewrites() {
		return [
			{
				source: '/:path*',
				destination: `/:path*`,
			},
			{
				source: '/report',
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				destination: `${process.env.REPORT_URL}/report`,
			},
			{
				source: '/report/:path*',
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				destination: `${process.env.REPORT_URL}/report/:path*`,
			},
		];
	},
};
