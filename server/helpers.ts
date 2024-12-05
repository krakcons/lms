import { alphabet, generateRandomString } from "oslo/crypto";

export function generateId(length: number): string {
	return generateRandomString(length, alphabet("a-z", "0-9"));
}
