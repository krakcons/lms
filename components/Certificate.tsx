"use client";

import {
	Document,
	Font,
	Image,
	Page as PDFPage,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";

Font.register({
	family: "Inter",
	fonts: [
		{
			src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf",
			fontWeight: 100,
		},
		{
			src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyfMZhrib2Bg-4.ttf",
			fontWeight: 200,
		},
		{
			src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuOKfMZhrib2Bg-4.ttf",
			fontWeight: 300,
		},
		{
			src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
			fontWeight: 400,
		},
		{
			src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf",
			fontWeight: 500,
		},
		{
			src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf",
			fontWeight: 600,
		},
		{
			src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf",
			fontWeight: 700,
		},
		{
			src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyYMZhrib2Bg-4.ttf",
			fontWeight: 800,
		},
		{
			src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuBWYMZhrib2Bg-4.ttf",
			fontWeight: 900,
		},
	],
});

// Create styles
const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		gap: 30,
		fontFamily: "Inter",
		fontWeight: "normal",
	},
	h1: {
		fontSize: 40,
		fontWeight: "bold",
	},
	p: {
		fontSize: 20,
	},
});

export type CertificateProps = {
	name: string;
	course: string;
	completedAt: string;
	teamName: string;
	logo?: string;
	text: {
		title: string;
		message: string;
		congratulations: {
			1: string;
			2: string;
		};
		date: string;
	};
};

export const Certificate = ({
	name,
	course,
	completedAt,
	teamName,
	text,
	logo,
}: CertificateProps) => {
	return (
		<Document>
			<PDFPage size="A4" orientation="landscape" style={styles.page}>
				{/* eslint-disable-next-line jsx-a11y/alt-text */}
				<Image
					src="/certificate.png"
					style={{
						position: "absolute",
						top: 0,
						right: 0,
						left: 0,
						bottom: 0,
					}}
				/>
				<Text style={[styles.h1, { marginTop: 15 }]}>{text.title}</Text>
				<Text>{text.message}</Text>
				<Text
					style={[
						styles.h1,
						{
							borderBottom: "1px solid black",
						},
					]}
				>
					{" " + name + " "}
				</Text>
				<View
					style={{
						justifyContent: "center",
						alignItems: "center",
						flexDirection: "row",
						flexWrap: "wrap",
						width: "100%",
						maxWidth: 550,
					}}
				>
					<Text>{text.congratulations[1]}</Text>
					<Text
						style={{
							fontWeight: "bold",
						}}
					>
						{" " + course}
					</Text>
					<Text>{" " + text.congratulations[2]}</Text>
					<Text
						style={{
							fontWeight: "bold",
						}}
					>
						{" " + teamName}.
					</Text>
				</View>
				<View
					style={{
						justifyContent: "center",
						alignItems: "center",
						width: 200,
					}}
				>
					<Text>{completedAt}</Text>
					<View
						style={{
							width: "100%",
							height: 1,
							backgroundColor: "black",
							marginVertical: 10,
						}}
					/>
					<Text>{text.date}</Text>
				</View>
				{logo && (
					/* eslint-disable-next-line jsx-a11y/alt-text */
					<Image
						src={logo}
						style={{
							height: 50,
							objectFit: "contain",
						}}
					/>
				)}
			</PDFPage>
		</Document>
	);
};
