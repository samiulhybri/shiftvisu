import { EventModel } from "@bryntum/schedulerpro-thin";

// Custom Appointment model, based on EventModel with additional fields and changed defaults
export class Assignment extends EventModel {
	declare event: string;
	declare requiredRole: string;

	static override get fields() {
		return [
			"event",
			"requiredRole",
			// override field defaultValue to hours
			{ name: "durationUnit", defaultValue: "m" },
		];
	}

	static override get defaults() {
		return {
			// In this demo, default duration for sessions will be hours (instead of days)
			durationUnit: "h",
		};
	}
}
