import { Tailwind } from "@/components/email/Tailwind";
import { buttonVariants } from "@/components/ui/button";
import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Text,
} from "@react-email/components";

export const LearnerInvite = ({
	href = "https://google.com",
	course = "Golfing Tutorial",
	organization = "Krak",
}: {
	href: string;
	course?: string;
	organization?: string;
}) => (
	<Html lang="en">
		<Head />
		<Preview>Con</Preview>
		<Tailwind>
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
