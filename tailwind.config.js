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
				"elevation-2": "#FFFFFF1A",
				"elevation-3": "#FFFFFF33",
				"elevation-4": "#FFFFFF4D",
				"light-gray": "#EBEBEB",
			},
		},
	},
	plugins: [],
};
