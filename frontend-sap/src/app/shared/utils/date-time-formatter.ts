import moment from "moment";

/**
 * Formate date string to dd.mm.yy, hr:min
 * @param dateString
 * @returns eg 03.06.2024, 11:06
 */
export function formatDate(dateString: Date | string, isCommaNeeded = true, isTimeNeeded = true, isAmMmNeed = false, isTwelveHour = false, isUTCNeeded = true) {
	if (!dateString) return '';
	const date = isUTCNeeded ? moment(dateString).utc().local() : moment(dateString);

	const day = date.format("DD");
	const month = date.format("MM");
	const year = date.format("YYYY");
	const hours = isTwelveHour ? date.format("hh") : date.format("HH");
	const minutes = date.format("mm");
	const ampm = date.format("A"); // Get AM/PM
	const result = isTimeNeeded ? `${day}.${month}.${year}${isCommaNeeded ? ',' : ''} ${hours}:${minutes} ${isAmMmNeed ? ampm : ''}` : `${day}.${month}.${year}`;
	return result;
}
