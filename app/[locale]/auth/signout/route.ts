import { logout } from "@/server/actions/auth";

export const POST = () => {
	logout();
};
