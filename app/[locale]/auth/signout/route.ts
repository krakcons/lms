import { redirect } from "@/lib/navigation";
import { logout } from "@/server/auth/actions";

export const GET = async () => {
	await logout();
	redirect("/");
};

export const POST = async () => {
	await logout();
};
