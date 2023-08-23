export const createNestedObject = (key: string, value: any): any => {
	const keys: string[] = key.split("."); // Split the key string into an array of keys

	const result: any = {};
	let currentObj: any = result;

	for (let i = 0; i < keys.length; i++) {
		const currentKey: string = keys[i];
		if (i === keys.length - 1) {
			currentObj[currentKey] = value;
		} else {
			currentObj[currentKey] = {};
			currentObj = currentObj[currentKey];
		}
	}

	return result;
};

export const mergeDeepObjects = (targetObj: any, sourceObj: any): any => {
	for (const key in sourceObj) {
		if (sourceObj.hasOwnProperty(key)) {
			if (
				typeof sourceObj[key] === "object" &&
				!Array.isArray(sourceObj[key]) &&
				sourceObj[key] !== null
			) {
				if (!targetObj[key] || typeof targetObj[key] !== "object") {
					targetObj[key] = {};
				}
				mergeDeepObjects(targetObj[key], sourceObj[key]);
			} else {
				targetObj[key] = sourceObj[key];
			}
		}
	}
	return targetObj;
};

export const addToObject = (obj: any, key: string, value: any): any => {
	const keys = key.split(".");
	let currentObj = obj;

	for (let i = 0; i < keys.length - 1; i++) {
		const currentKey = keys[i];
		if (
			!currentObj[currentKey] ||
			typeof currentObj[currentKey] !== "object"
		) {
			currentObj[currentKey] = {};
		}
		currentObj = currentObj[currentKey];
	}

	const lastKey = keys[keys.length - 1];
	currentObj[lastKey] = value;

	return obj;
};

export const findNestedValue = (key: string, data: any): any => {
	if (!key || key === "") {
		return "";
	}

	const keys: string[] = key.split(".");
	let currentObj: any = { ...data };

	for (const currentKey of keys) {
		if (currentObj.hasOwnProperty(currentKey)) {
			currentObj = currentObj[currentKey];
		} else {
			return "";
		}
	}

	return currentObj;
};

export const formatFileSize = (bytes: number, si = false, dp = 1) => {
	const thresh = si ? 1000 : 1024;

	if (Math.abs(bytes) < thresh) {
		return bytes + " B";
	}

	const units = si
		? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
		: ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	let u = -1;
	const r = 10 ** dp;

	do {
		bytes /= thresh;
		++u;
	} while (
		Math.round(Math.abs(bytes) * r) / r >= thresh &&
		u < units.length - 1
	);

	return bytes.toFixed(dp) + " " + units[u];
};
