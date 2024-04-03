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

export const CourseCompletion = ({
	course = "Golfing Tutorial",
	organization = "Krak",
	href = "https://google.com",
}: {
	course?: string;
	organization?: string;
	href?: string;
}) => (
	<Html lang="en">
		<Head />
		<Preview>Course Completed</Preview>
		<Tailwind>
			<Body className="mx-auto my-auto bg-white font-sans">
				<Container className="mx-auto mt-[40px] max-w-[465px] rounded border border-solid border-border p-8 text-foreground">
					<Heading className="mt-0">Course Completed!</Heading>
					<Text>
						Congratulations! You have completed the course{" "}
						<strong>{course}</strong>
						{" by "}
						<strong>{organization}</strong>. Attached is your
						completion certificate.
					</Text>
					<Button
						className={buttonVariants({
							class: "h-auto py-3",
						})}
						href={href}
					>
						Get Certificate
					</Button>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export default CourseCompletion;
