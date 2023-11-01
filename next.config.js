const { withAxiom } = require("next-axiom");
const withNextIntl = require("next-intl/plugin")();
const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		serverActions: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img.clerk.com",
				port: "",
				pathname: "/**",
			},
		],
	},
	async redirects() {
		return [
			{
				source: "/:locale/api",
				destination: "/api",
				permanent: true,
			},
		];
	},
};

module.exports = withBundleAnalyzer(withAxiom(withNextIntl(nextConfig)));
