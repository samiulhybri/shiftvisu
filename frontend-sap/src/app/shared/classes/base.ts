import { IntlService, CldrIntlService } from "@progress/kendo-angular-intl";
import { readCookie } from "@app/shared/helpers/read-cookie";
export class Base {
	constructor(intlService: IntlService) {
		var _lang = readCookie("sct_language");
		switch (_lang) {
			case "de":
				(<CldrIntlService>intlService).localeId = "de-DE";
				break;
			case "it":
				(<CldrIntlService>intlService).localeId = "it-IT";
				break;
			case "en":
				(<CldrIntlService>intlService).localeId = "en-US";
				break;
			default:
				(<CldrIntlService>intlService).localeId = "en-US";
				break;
		}
	}
}
