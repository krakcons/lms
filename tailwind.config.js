/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				"elevation-1": "#121212",
				"elevation-2": "#FFFFFF0F",
				"elevation-3": "#FFFFFF1F",
				"elevation-4": "#FFFFFF2E",
				"light-gray": "#EBEBEB",
			},
		},
	},
	plugins: [],
};
