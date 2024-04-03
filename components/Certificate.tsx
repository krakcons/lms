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
			src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf",
			fontWeight: 100,
		},
		{
			src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyfMZhrib2Bg-4.ttf",
			fontWeight: 200,
		},
		{
			src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuOKfMZhrib2Bg-4.ttf",
			fontWeight: 300,
		},
		{
			src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
			fontWeight: 400,
		},
		{
			src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf",
			fontWeight: 500,
		},
		{
			src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf",
			fontWeight: 600,
		},
		{
			src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf",
			fontWeight: 700,
		},
		{
			src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyYMZhrib2Bg-4.ttf",
			fontWeight: 800,
		},
		{
			src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuBWYMZhrib2Bg-4.ttf",
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
	completedAt: Date;
	teamName: string;
};

export const Certificate = ({
	name,
	course,
	completedAt,
	teamName,
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
				<Text style={styles.h1}>Certificate of Completion</Text>
				<Text>This certificate is proudly awarded to</Text>
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
				<Text
					style={{
						maxWidth: 550,
						textAlign: "center",
					}}
				>
					Congratulations! You have successfully completed {course}{" "}
					with {teamName}.
				</Text>
				<View
					style={{
						justifyContent: "center",
						alignItems: "center",
						width: 200,
					}}
				>
					<Text>{completedAt.toDateString()}</Text>
					<View
						style={{
							width: "100%",
							height: 1,
							backgroundColor: "black",
							marginVertical: 10,
						}}
					/>
					<Text>DATE OF COMPLETION</Text>
				</View>
			</PDFPage>
		</Document>
	);
};
