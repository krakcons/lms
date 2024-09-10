import { Link } from "@/lib/navigation";
import NotFound from "../NotFound";

export default function NotFoundPage() {
	return (
		<NotFound>
			<Link href="/">Return Home</Link>
		</NotFound>
	);
}
