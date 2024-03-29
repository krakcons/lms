import { redirect } from "@/lib/navigation";
import { logout } from "@/server/auth/actions";

export const GET = () => {
	logout();
	redirect("/");
};

export const POST = () => {
	logout();
};
