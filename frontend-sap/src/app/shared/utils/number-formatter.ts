import { readCookie } from "@app/shared/helpers/read-cookie";

export const formatValue = (value: number, precision: number) => {
	if (value % 1 !== 0) {
		let factor = Math.pow(10, precision);
		let calculatedValue = Math.floor(value * factor * 100) / factor;
		return calculatedValue > 100 ? Math.floor(calculatedValue) : calculatedValue;
	}
	return value * 100;
};

export const formatNumber = (
	value: number,
	minFractionDigits: number = 0,
	maxFractionDigits: number = 5
): string => {
	return format(value, minFractionDigits, maxFractionDigits, "number");
};

export const formatCurrency = (
	value: number,
	minFractionDigits: number = 0,
	maxFractionDigits: number = 5
): string => {
	return format(value, minFractionDigits, maxFractionDigits, "currency");
};

export const formatPercent = (
	value: number,
	minFractionDigits: number = 0,
	maxFractionDigits: number = 5
): string => {
	return format(value, minFractionDigits, maxFractionDigits, "percent");
};

const format = (
	value: number,
	minFractionDigits: number = 0,
	maxFractionDigits: number = 5,
	type: "number" | "currency" | "percent" = "number"
): string => {
	if (isNaN(value)) return "";

	const _lang = readCookie("sct_language") ?? "en";
	let locale: string = "en-US";

	const localeMap: Record<string, string> = {
		de: "de-DE",
		it: "it-IT",
		en: "en-US",
		tr: "tr-TR",
		fr: "fr-FR",
	};

	if (_lang in localeMap) {
		locale = localeMap[_lang];
	}

	const options: Intl.NumberFormatOptions = {
		minimumFractionDigits: minFractionDigits,
		maximumFractionDigits: maxFractionDigits,
	};

	const currencyMap: Record<string, string> = {
		"de-DE": "EUR",
		"it-IT": "EUR",
		"fr-FR": "EUR",
		"en-US": "USD",
		"tr-TR": "TRY",
	};

	if (type === "currency") {
		options.style = "currency";
		options.currency = currencyMap[locale] || "USD";
	} else if (type === "percent") {
		options.style = "percent";
		options.minimumFractionDigits = Math.min(0, minFractionDigits);
		options.maximumFractionDigits = Math.min(2, maxFractionDigits);
	}

	return new Intl.NumberFormat(locale, options).format(value);
};
