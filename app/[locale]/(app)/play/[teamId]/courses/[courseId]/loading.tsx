import { Loader2 } from "lucide-react";

const Loading = () => {
	return (
		<div className="absolute flex h-screen w-screen items-center justify-center bg-background">
			<Loader2 size={48} className="animate-spin" />
		</div>
	);
};

export default Loading;
