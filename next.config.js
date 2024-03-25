const withNextIntl = require("next-intl/plugin")();

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	async rewrites() {
		return [
			{
				source: "/:locale/r2/:slug*",
				destination:
					"https://pub-4cd6330f5bdf4bfaadef07fedda4411b.r2.dev/:slug*",
				locale: false,
			},
		];
	},
	async redirects() {
		return [
			{
				source: "/:path*/scormcontent/0",
				destination: "/:path*/scormcontent/index.html",
				permanent: true,
			},
		];
	},
	// Need to fix 404 on courses
	experimental: {
		// ppr: true,
	},
};

module.exports = withNextIntl(nextConfig);
