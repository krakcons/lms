"use server";

export const uploadCourse = async (formData: FormData) => {
	console.log(formData.get("file"));
};
