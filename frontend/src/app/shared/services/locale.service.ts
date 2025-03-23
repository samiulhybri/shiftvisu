import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { formatDate } from '@angular/common';

import localeEn from '@angular/common/locales/en';
import localeIt from '@angular/common/locales/it';
import localeDe from '@angular/common/locales/de';
import localeTr from '@angular/common/locales/tr';

@Injectable({
    providedIn: 'root'
})
export class LocaleService {

    constructor(@Inject(LOCALE_ID) public localeId: string) {
        // Register the default locale data
        this.registerLocaleData(this.localeId);
    }

    registerLocaleData(locale: string) {
        switch (locale) {
            case 'en-US':
                registerLocaleData(localeEn);
                break;
            case 'it-IT':
                registerLocaleData(localeIt);
                break;
            case 'de-DE':
                registerLocaleData(localeDe);
                break;
            case 'tr-TR':
                registerLocaleData(localeTr);
                break;
            default:
                registerLocaleData(localeEn);
                break;
        }
    }

    setLocale(locale: string) {
        this.localeId = locale;
        this.registerLocaleData(locale);
    }

    format(date: Date, formatStr: string): string {
        return formatDate(date, formatStr, this.localeId);
    }
}
