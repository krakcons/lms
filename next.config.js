const withNextIntl = require("next-intl/plugin")();
const { withAxiom } = require("next-axiom");

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: false,
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
	async headers() {
		return [
			{
				source: "/api/:path*",
				headers: [
					{ key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
					{
						key: "Access-Control-Allow-Methods",
						value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
					},
					{
						key: "Access-Control-Allow-Headers",
						value: "x-api-token, Content-Type",
					},
				],
			},
		];
	},
	experimental: {
		ppr: true,
	},
};

module.exports = withAxiom(withNextIntl(nextConfig));
