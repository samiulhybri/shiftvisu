import { Component, ViewChild } from "@angular/core";
import LanguageState from "@app/shared/models/language-state.model";
import { CommonService } from "@app/shared/services/common.service";

@Component({
	selector: "app-translation",
	templateUrl: "./translation.component.html",
	styleUrl: "./translation.component.css",
})
export class TranslationComponent {
	selectedLanguageName: string = "";
	selectedLanguageCode: string = "";
	selectedLanguage: any = [];
	@ViewChild("menu", { static: false }) menu: any;
	storedLanguageName?: any;
	url = window.location.href;

	constructor(public commonService: CommonService) {}

	getCookie(name: string): string {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);

		if (parts.length === 2) {
			const cookieValue = parts.pop();
			if (cookieValue) {
				return cookieValue.split(";").shift() ?? "en";
			}
		}

		return "en";
	}

	ngOnInit(): void {
		this.loadLanguage();

		const storedLastPart = this.getCookie("sct_language") || "en";
		this.storedLanguageName = localStorage.getItem("selectedLanguageName") || "English";

		if (storedLastPart) {
			this.selectedLanguageCode = storedLastPart;
			const url = new URL(this.url);
			const isOnTargetURL = url.pathname.includes(`/${storedLastPart}/`);
			const regex = /\/(en|de|it|tr|bg|ro)\//;
			const isLanguageInURL = regex.test(url.pathname);

			if (isLanguageInURL && !isOnTargetURL) {
				url.href = url.href.replace(regex, `/${this.selectedLanguageCode}/`);
				window.history.replaceState({}, "", url.href);
				window.location.reload();
			}
		}
	}

	languageMenu() {
		this.menu.elementRef.nativeElement.open = true;
	}

	loadLanguage() {
		this.commonService.get("Languages").subscribe({
			next: (data: any) => {
				const allowedCodes = ["en", "de", "it", "bg","ro","tr"];
				const uniqueLanguages = new Map();

				this.selectedLanguage = data.value
					.filter((language: any) => allowedCodes.includes(language.code))
					.filter((language: any) => {
						if (!uniqueLanguages.has(language.code)) {
							uniqueLanguages.set(language.code, true);
							return true;
						}
						return false;
					})
					.map((language: any) => {
						return new LanguageState().deserialize(language);
					});
			},
		});
	}

	onMenuItemSelect(event: any): void {
		this.url = window.location.href;
		this.selectedLanguageName = event.detail.item.getAttribute("text");
		const selectedLanguage = this.selectedLanguage.find(
			(lang: any) => lang.name === this.selectedLanguageName
		);

		if (selectedLanguage) {
			this.selectedLanguageCode = selectedLanguage.code;
			this.storedLanguageName = selectedLanguage.name;
			const url = new URL(this.url);
			const regex = /\/(en|de|it|tr|bg|ro)\//;
			url.href = url.href.replace(regex, `/${this.selectedLanguageCode}/`);
			localStorage.setItem("CurrentLanguage", this.selectedLanguageCode);
			localStorage.setItem("selectedLanguageName", this.storedLanguageName);

			this.setSessionCookie("sct_language", this.selectedLanguageCode);

			window.history.replaceState({}, "", url.href);
			window.location.reload();
		}
	}

	setSessionCookie(name: string, value: string) {
		document.cookie = `${name}=${value}; path=/`;
	}
}
