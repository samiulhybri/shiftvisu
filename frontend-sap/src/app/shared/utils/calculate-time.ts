import moment from 'moment';


/**
 * Calculate time duration with date and time
 * @param startTime 
 * @param endTime 
 * @returns eg 2:03:00
 */
export function calDuration(startTime: Date, endTime: Date) {
    if (!startTime || !endTime) {
        return "";
    }
	const start = moment(startTime);
    const end = moment(endTime);

    const duration = moment.duration(end.diff(start));

    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedHours = String(hours).padStart(2, "0");
    const formattedDays = String(days);

    return `${formattedDays}:${formattedHours}:${formattedMinutes}`;
}

export const convertMinToSec = (value: any) => {
	return value * 60;
}

export const convertSecToMin = (value: any) => {
	return Math.floor(value / 60);
}

export const convertToMS = (value: number, unit: "Second" | "Minute" | "Hour") => {
	switch (unit) {
		case "Second":
			return value * 1000;
		case "Minute":
			return value * 60 * 1000;
		case "Hour":
			return value * 60 * 60 * 1000;
	}
};