import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { Deserializable } from "@app/shared/interfaces/deserializable";
import { DateToConsider } from "@app/shared/enums/DateToConsider";
import { Capacity } from "@app/shared/models/capacity.model";

export class Shift implements Deserializable {
	id?: number;
	is_active: boolean = true;
	custom_id?: string = "";
	name?: string = "";
	start_time?: string = "";
	end_time?: string = "";
	hours?: number = 0;
	created_at?: string;
	updated_at?: string;
	date_to_consider?: string = DateToConsider.SHIFT_START;
	break_minutes?: number = 0;

	valueStateForHours: keyof typeof ValueState = "None"; // Dev purpose only
	valueStateForShiftCode: keyof typeof ValueState = "None"; // Dev purpose only
	isUsed: boolean = false; // Dev purpose only, user should be to change anything from shift if it is already used in shift model
	
	static readonly HOURS_IN_A_DAY: number = 24;
	static readonly MINUTES_IN_AN_HOUR: number = 60;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input?.start_time) {
			this.start_time = this.getTimeInHHMMFormat(input.start_time)
			this.start_time = this.convertTime(this.start_time, false)
		}
		
		if (input?.end_time){
			 this.end_time = this.getTimeInHHMMFormat(input.end_time);
			 this.end_time = this.convertTime(this.end_time, false);
		}

		if(input?.hasShiftModels) this.isUsed = true;

		this.hours = parseFloat(this.calculateHours());
		return this;
	}

	getTimeInHHMMFormat(time: string) {
		return time?.split(":").slice(0, 2)?.join(":");
	}

	calculateHours() {
		if (this.start_time && this.end_time) {
			const start_time = new Date(`2000-01-01T${this.start_time}Z`);
			const end_time = new Date(`2000-01-01T${this.end_time}Z`);

			// Adjust start_time to tomorrow's date if start_time is greater than end_time
			if (start_time > end_time) {
				end_time.setDate(end_time.getDate() + 1); // Move to tomorrow
			}

			const diffInMilliseconds = end_time.getTime() - start_time.getTime();
			const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
			const diffInHours = Math.floor(diffInMinutes / 60);
			const remainingMinutes = diffInMinutes % 60;
			const totalHours = diffInHours + remainingMinutes / 60;
			this.hours = totalHours == 0 ? 24 : totalHours;

			return this.hours.toFixed(2);
		} else return "0";
	}

	isDateOverlapped(capacities: Capacity[]): boolean {
		const getTime = (time: string): number => {
			const [hours, minutes] = time.split(":").map(Number);
			return hours * Shift.MINUTES_IN_AN_HOUR + minutes;
		};

		let minStartTime = Infinity;
		let maxEndTime = -Infinity;

		for (let i = 0; i < capacities.length; i++) {
			let startTime1 = getTime(capacities[i].start_time || "00:00");
			let endTime1 = getTime(capacities[i].end_time || "00:00");

			if (endTime1 <= startTime1) {
				endTime1 += Shift.HOURS_IN_A_DAY * Shift.MINUTES_IN_AN_HOUR; // Adjust for shifts that end after midnight
			}

			// Update min and max times
			minStartTime = Math.min(minStartTime, startTime1);
			maxEndTime = Math.max(maxEndTime, endTime1);

			for (let j = i + 1; j < capacities.length; j++) {
				let startTime2 = getTime(capacities[j].start_time || "00:00");
				let endTime2 = getTime(capacities[j].end_time || "00:00");

				if (endTime2 <= startTime2) {
					endTime2 += Shift.HOURS_IN_A_DAY * Shift.MINUTES_IN_AN_HOUR; // Adjust for shifts that end after midnight
				}

				// Check for overlap
				if (
					(startTime1 < endTime2 && endTime1 > startTime2) ||
					(startTime2 < endTime1 && endTime2 > startTime1)
				) {
					return true;
				}
			}
		}

		// Check if the total duration exceeds 24 hours
		if (maxEndTime - minStartTime > Shift.HOURS_IN_A_DAY * Shift.MINUTES_IN_AN_HOUR) {
			return true; // Considered as overlap if total duration exceeds 24 hours
		}

		return false;
	}

	convertTime(time: string, isUTC: boolean): string {
		// Get local timezone offset in minutes
		const offset = -new Date().getTimezoneOffset(); // Positive for UTC+X, negative for UTC-X

		const [hours, minutes] = time.split(":").map(Number);
	
		if (
		  isNaN(hours) || isNaN(minutes) ||
		  hours < 0 || hours > 23 ||
		  minutes < 0 || minutes > 59
		) {
		  throw new Error("Invalid time format. Please provide time in HH:mm format.");
		}
	
		// Create a Date object for the given time
		const baseDate = new Date(2025, 0, 1, hours, minutes); // Fixed date for consistency
	
		// Adjust for UTC or local based on isUTC
		const adjustedDate = isUTC
		  ? new Date(baseDate.getTime() - offset * 60 * 1000) // UTC to Local
		  : new Date(baseDate.getTime() + offset * 60 * 1000); // Local to UTC
	
		// Format the adjusted time
		const resultHours = adjustedDate.getHours().toString().padStart(2, "0");
		const resultMinutes = adjustedDate.getMinutes().toString().padStart(2, "0");
	
		return `${resultHours}:${resultMinutes}`;
	}

	toOdata(): Object {
		return {
			...this,
			start_time: this.convertTime(this.start_time || '', true),
			end_time: this.convertTime(this.end_time || '', true),
			valueStateForHours: undefined,
			valueStateForShiftCode: undefined,
			breakTime: undefined,
			hours: undefined,
			isSelected: undefined,
			hasShiftModels: undefined,
			isUsed: undefined,
		};
	}
}
