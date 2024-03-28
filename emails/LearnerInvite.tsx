import { buttonVariants } from "@/components/ui/button";
import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Tailwind,
	Text,
} from "@react-email/components";

interface Props {
	email?: string;
	href: string;
	course?: string;
	organization?: string;
}

export const LearnerInvite = ({
	href = "https://google.com",
	course = "Golfing Tutorial",
	organization = "Krak",
}: Props) => (
	<Html lang="en">
		<Head />
		<Preview>Join this course</Preview>
		<Tailwind
			config={{
				theme: {
					extend: {
						colors: {
							background: "#FFFFFF",
							foreground: "#0A1F44",
							card: "#FFFFFF",
							"card-foreground": "#0A1F44",
							popover: "#FFFFFF",
							"popover-foreground": "#0A1F44",
							primary: "#1C2A47",
							"primary-foreground": "#F2F8FC",
							secondary: "#F1F5F9",
							"secondary-foreground": "#1C2A47",
							muted: "#F1F5F9",
							"muted-foreground": "#767D92",
							accent: "#F1F5F9",
							"accent-foreground": "#1C2A47",
							destructive: "#FF3B30",
							"destructive-foreground": "#F2F8FC",
							border: "#E9F2FA",
							input: "#E9F2FA",
							ring: "#0A1F44",
						},
						borderRadius: {
							custom: "0.5rem",
						},
					},
				},
			}}
		>
			<Body className="mx-auto my-auto bg-white font-sans">
				<Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-border p-8 text-foreground">
					<Heading className="mt-0">Course Invitation</Heading>
					<Text className="text-sm">
						You have been invited to join <strong>{course}</strong>
						{" by "}
						<strong>{organization}</strong>.
					</Text>
					<Button
						className={buttonVariants({
							class: "h-auto py-3",
						})}
						href={href}
					>
						Start Course
					</Button>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export default LearnerInvite;
