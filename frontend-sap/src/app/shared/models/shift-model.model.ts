import { Color } from "@app/shared/enums/Color";
import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Shift } from "@app/shared/models/shift.model";

export class ShiftModel implements Deserializable {
	id?: number;
	custom_id?: string = "";
	name?: string = "";
	total_shift?: number = 0;
	color?: string = Color.BLACK;
	total_work_hour?: number | string = 0;
	created_at?: string;
	updated_at?: string;
	shift?: Shift[];
	isSelected?: boolean = false;
	isSubmittable?: boolean = false; // dev purpose only

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
		if (input.shift) {
			this.shift = input.shift.map((data: any) => new Shift().deserialize(data));
		} else {
			this.shift = [];
		}

		this.total_shift = this.calculateShift() ?? 0;
		this.total_work_hour = this.calculateTotalWorkHour(true) ?? 0;

		return this;
	}

	calculateShift() {
		this.total_shift = this.shift?.length;
		return this.total_shift;
	}

	calculateTotalWorkHour(isFromApi = false) {
		this.total_work_hour = 0;
		this.shift?.forEach((shift: Shift) => {
			if (shift.hours && this.total_work_hour != undefined) {
				if (typeof shift.hours == "string") shift.hours = parseInt(shift.hours);
				this.total_work_hour = (shift.hours as number) + (this.total_work_hour as number);
			}
		});

		this.isSubmittable = this.total_work_hour == 24 ? true : false;

		this.total_work_hour = isFromApi
			? this.decimalToHHMM(this.total_work_hour)
			: this.total_work_hour;

		return this.total_work_hour;
	}

	calculateRemainingHours() {
		const timeDifference = ` ${24 - (parseFloat(this.total_work_hour?.toString() || "") || 0)}`;
		return parseFloat(timeDifference).toFixed(2);
	}

	calculateHours() {
		this.isSubmittable = true;
		let codes: string[] = [];

		this.shift?.map((shift: any) => {
			const isDuplicate = this.findDuplicates(shift.custom_id || "", codes);
			codes.push(shift.custom_id || "");
			if (shift && shift.start_time && shift.end_time) {
				const start_time = new Date(`2000-01-01T${shift.start_time}Z`);
				const end_time = new Date(`2000-01-01T${shift.end_time}Z`);

				// Adjust start_time to tomorrow's date if start_time is greater than end_time
				if (start_time > end_time) {
					end_time.setDate(end_time.getDate() + 1); // Move to tomorrow
				}

				const diffInMilliseconds = end_time.getTime() - start_time.getTime();
				const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
				const diffInHours = Math.floor(diffInMinutes / 60);
				const remainingMinutes = diffInMinutes % 60;
				const hours = (diffInHours + remainingMinutes / 60).toFixed(2);

				shift.hours = parseFloat(hours);
				shift.valueStateForHours = shift.hours < 0 ? "Negative" : "None";
				shift.valueStateForShiftCode =
					!shift.custom_id || isDuplicate ? "Negative" : "None";

				if (
					shift.valueStateForHours == "Negative" ||
					shift.valueStateForShiftCode == "Negative"
				) {
					this.isSubmittable = false;
				}
			} else {
				this.isSubmittable = false;
				shift.valueStateForShiftCode =
					!shift.custom_id || isDuplicate ? "Negative" : "None";
			}
		});
		return this.shift;
	}

	findDuplicates = (shift: string, codes: string[]) => codes.find(item => item === shift);

	decimalToHHMM(decimalHours: number | string) {
		const hours = Math.floor(decimalHours as number);
		const minutes = Math.round(((decimalHours as number) - hours) * 60);

		// Formatting
		const hoursStr = hours < 10 ? "0" + hours : hours;
		const minutesStr = minutes < 10 ? "0" + minutes : minutes;

		return `${hoursStr || 0} hrs ${minutesStr || 0} min`;
	}

	getShiftsName() {
		const shiftNames: string[] = [];
		this.shift?.forEach(shift => shiftNames.push(shift?.name || ""));

		if (shiftNames.length) {
			return `${shiftNames.length} [${shiftNames.join(' , ')}]`;
		}
		return `0`;
	}

	toOdata(): this {
		return {
			...this,
			total_shift: undefined,
			color: undefined,
			total_work_hour: undefined,
			shift: undefined,
			isSubmittable: undefined,
			isSelected: undefined,
		};
	}
}
