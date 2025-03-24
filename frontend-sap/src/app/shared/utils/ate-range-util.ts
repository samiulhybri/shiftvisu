export function getTodayAnd12WeeksLater(): { today: string; lastDate: string } {
	const today = new Date();

	// Create a new date object and add 12 weeks (84 days) to today
	const lastDate = new Date();
	lastDate.setDate(today.getDate() + (12 * 7) - 1); // Subtract 1 day to get the exact end of 12 weeks

	// Format both dates to "YYYY-MM-DD"
	const formatDate = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	return {
		today: formatDate(today),
		lastDate: formatDate(lastDate),
	};
}
