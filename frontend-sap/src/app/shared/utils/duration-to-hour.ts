export const convertSeconds = (seconds: number, secondNeeded: boolean = false): string => {
	const hours = Math.floor(seconds / 3600)
		.toString()
		.padStart(2, "0");
	const minutes = Math.floor((seconds % 3600) / 60)
		.toString()
		.padStart(2, "0");
	const remainingSeconds = Math.floor(seconds % 60).toString();

	return secondNeeded ? `${hours}:${minutes}:${remainingSeconds}` : `${hours}:${minutes}`;
};