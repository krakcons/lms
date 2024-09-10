const NotFound = ({
	title = "Not Found",
	description = "Could not find requested resource",
	children,
}: {
	title?: string;
	description?: string;
	children?: React.ReactNode;
}) => {
	return (
		<div className="m-auto flex flex-col items-center gap-4">
			<h1>{title}</h1>
			<p className="text-lg text-muted-foreground">{description}</p>
			{children}
		</div>
	);
};

export default NotFound;
