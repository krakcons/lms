import { redirect } from "@/lib/navigation";
import { logout } from "@/server/actions/auth";

export const GET = () => {
	logout();
	redirect("/");
};

export const POST = () => {
	logout();
};
