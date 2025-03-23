import { Injectable } from '@angular/core';
import { CookieService } from '@app/services/cookie.service';
import { CommonService } from '@app/shared/services/common.service';

@Injectable({
	providedIn: 'root'
})
export class LanguageService {

	constructor(private cookieService: CookieService, private commonService: CommonService) { }

	initializeLanguage(): Promise<void> {
		const savedLanguage = this.getLanguage();
		const languageCode = location.pathname.split('/')[2];
		const originHref = location.href;
		const modifidedHref = originHref.replace('/' + languageCode + '/', '/' + savedLanguage + '/')
		if (originHref != modifidedHref) location.href = modifidedHref;
		return Promise.resolve();
	}

	switchLanguage(language: string) {
		this.cookieService.set('sct_language', language);
		this.initializeLanguage();
	}

	getLanguage() {
		const language = this.cookieService.get('sct_language')
		if(!language) this.cookieService.set('sct_language', 'en');
		return this.cookieService.get('sct_language');
	}

	getLanguageList() {
		const url = `Languages?filter=is_active eq 1&$select=id,custom_id,name,code`;
		return this.commonService.get(`${url}`);
	}

}
