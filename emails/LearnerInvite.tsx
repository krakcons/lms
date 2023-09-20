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
	href,
	email = "dave@gmail.com",
	course = "Golfing Tutorial",
	organization = "Krak",
}: Props) => (
	<Html lang="en">
		<Head />
		<Preview>Join this course</Preview>
		<Tailwind>
			<Body className="mx-auto my-auto bg-white font-sans">
				<Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
					<Heading>Course Invitation</Heading>
					<Text>
						Hello <strong>{email}</strong>,
					</Text>
					<Text>
						You have been invited to join <strong>{course}</strong>
						{" by "}
						<strong>{organization}</strong>.
					</Text>
					<Button
						pX={20}
						pY={12}
						className="rounded bg-[#000000] text-center text-[12px] font-semibold text-white no-underline"
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
