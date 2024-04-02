import { Tailwind } from "@/components/email/Tailwind";
import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Text,
} from "@react-email/components";

export const LearnerInvite = ({
	course = "Golfing Tutorial",
	organization = "Krak",
}: {
	course?: string;
	organization?: string;
}) => (
	<Html lang="en">
		<Head />
		<Preview>Course Completed</Preview>
		<Tailwind>
			<Body className="mx-auto my-auto bg-white font-sans">
				<Container className="mx-auto mt-[40px] max-w-[465px] rounded border border-solid border-border p-8 text-foreground">
					<Heading className="mt-0">Course Completed!</Heading>
					<Text className="mb-0">
						Congratulations! You have completed the course{" "}
						<strong>{course}</strong>
						{" by "}
						<strong>{organization}</strong>. Attached is your
						completion certificate.
					</Text>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export default LearnerInvite;
