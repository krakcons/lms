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
	text = {
		title: "Congratulations!",
		completed: "Completed",
		congratulations: "Congratulations! You have completed",
		certificate: "Download your certificate of completion:",
		get: "Download",
		by: "offered by",
	},
}: {
	course?: string;
	organization?: string;
	href?: string;
	text: {
		title: string;
		completed: string;
		congratulations: string;
		by: string;
		certificate: string;
		get: string;
	};
}) => (
	<Html lang="en">
		<Head />
		<Preview>{text.title}</Preview>
		<Tailwind>
			<Body className="mx-auto my-auto bg-white font-sans">
				<Container className="mx-auto mt-[40px] max-w-[465px] rounded border border-solid border-border p-8 text-foreground">
					<Heading className="mt-0">
						{text.title} {course} {text.completed}
					</Heading>
					<Text>
						{`${text.congratulations} `}
						<strong>{course}</strong>
						{` ${text.by} `}
						<strong>{organization}</strong>. {text.certificate}
					</Text>
					<Button
						className={buttonVariants({
							class: "h-auto py-3",
						})}
						href={href}
					>
						{text.get}
					</Button>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export default CourseCompletion;
