import { Injectable } from "@angular/core";
import moment from "moment";

@Injectable({
	providedIn: "root", // Makes this service available globally
})
export class WeekGeneratorService {
	constructor() {}

	/**
	 * Generates a list of ISO week strings starting from the current date.
	 * @param weeksCount Number of weeks to generate. Default is 12.
	 * @returns Array of strings in 'YYYY-WW' format.
	 */

	getNextWeeks(weeksCount: number = 12): string[] {
		const weeks: string[] = [];
		let currentDate = moment();

		for (let i = 0; i < weeksCount; i++) {
			const year = currentDate.isoWeekYear();
			const week = currentDate.isoWeek();
			weeks.push(`${year}-${String(week).padStart(2, "0")}`);
			currentDate.add(1, "week");
		}
		return weeks;
	}
	getWeeksAndYearsBetweenDates(startDate: Date, endDate: Date): { Year: number; Week: number, YearWeek: string }[] {
		const result: { Year: number; Week: number, YearWeek: string }[] = [];

		// Helper function to get the week number and year from a date
		function getWeekNumber(date: Date): { weekNumber: number; year: number } {
			const startOfYear = new Date(date.getFullYear(), 0, 1);
			const days = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 3600 * 24));
			const weekNumber = Math.ceil((days + 1) / 7);
			return { weekNumber, year: date.getFullYear() };
		}

		let currentStartDate = new Date(startDate);

		// Loop through the weeks
		while (currentStartDate <= endDate) {
			const { weekNumber, year } = getWeekNumber(currentStartDate);

			// Calculate the end date of the current week
			const currentEndDate = new Date(currentStartDate);
			currentEndDate.setDate(currentStartDate.getDate() + 6);

			// If the current week end date exceeds the endDate, adjust it
			if (currentEndDate > endDate) {
				currentEndDate.setTime(endDate.getTime());
			}

			// Format the week as "Year: X, Week: Y"
			result.push({ Year: year, Week: weekNumber, YearWeek: `${year}-${String(weekNumber).padStart(2, "0")}` }); //`Year: ${year}, Week: ${weekNumber"}`Year: ${year}, Week: ${weekNumber} (${currentStartDate.toDateString()} - ${currentEndDate.toDateString()})`);

			// Move to the next week (7 days forward)
			currentStartDate.setDate(currentStartDate.getDate() + 7);
		}
		return result;
	}
}
