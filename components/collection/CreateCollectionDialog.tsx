"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/api";
import { useRouter } from "@/lib/navigation";
import { CreateCollection, CreateCollectionSchema } from "@/types/collections";
import { CreateCourse } from "@/types/course";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const CreateCollectionDialog = () => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const form = useForm<CreateCollection>({
		resolver: zodResolver(CreateCollectionSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	const { mutate } = useMutation({
		mutationFn: client.api.collections.$post,
		onSuccess: async () => {
			router.refresh();
		},
	});

	// 2. Define a submit handler.
	const onSubmit = (values: CreateCourse) => {
		mutate({
			json: values,
		});
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="flex h-32 flex-col">
					<div className="flex flex-col items-center justify-center gap-4">
						<Plus size={24} />
						Create Collection
					</div>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>Create Collection</DialogTitle>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-8"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">Submit</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
