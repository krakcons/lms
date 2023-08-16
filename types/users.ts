export type User = {
	id: string;
	lastName: string | null;
	firstName: string | null;
	username: string | null;
	imageUrl: string;
	emailAddress: string | null;
};

export type WithUser<T> = T & { user: User };
