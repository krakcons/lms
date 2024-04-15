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

export const CollectionInvite = ({
	collection = "Volunteer Training",
	organization = "Krak",
	text = {
		title: "Collection Invite",
		invite: "You have been invited to the collection",
		by: "by",
		start: "Start learning",
	},
	courses = [
		{
			href: "https://google.com",
			title: "Golfing Tutorial",
		},
		{
			href: "https://google.com",
			title: "Medical Training",
		},
	],
}: {
	collection?: string;
	courses: {
		href: string;
		title: string;
	}[];
	organization?: string;
	text: {
		title: string;
		invite: string;
		by: string;
		start: string;
	};
}) => (
	<Html lang="en">
		<Head />
		<Preview>{`${text.invite} ${collection} by ${organization}.`}</Preview>
		<Tailwind>
			<Body className="mx-auto my-auto bg-white font-sans">
				<Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-border p-8 text-foreground">
					<Heading className="mt-0">{text.title}</Heading>
					<Text>
						{text.invite} <strong>{collection}</strong>
						{` ${text.by} `}
						<strong>{organization}</strong>.
					</Text>
					{courses.map((course, index) => (
						<Container
							key={index}
							className="mt-4 rounded border border-solid border-border p-4"
						>
							<Text className="mt-0 text-base font-bold">
								{course.title}
							</Text>
							<Button
								className={buttonVariants({
									class: "h-auto py-3",
								})}
								href={course.href}
							>
								{text.start}
							</Button>
						</Container>
					))}
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export default CollectionInvite;
