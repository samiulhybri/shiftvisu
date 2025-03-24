import { APP_INITIALIZER, LOCALE_ID, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";

import { InputsModule } from "@progress/kendo-angular-inputs";

import {
  IntlService,
  CldrIntlService,
  IntlModule,
} from "@progress/kendo-angular-intl";

import "@progress/kendo-angular-intl/locales/en/all";
import "@progress/kendo-angular-intl/locales/de/all";
import "@progress/kendo-angular-intl/locales/it/all";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { provideFirebaseApp } from "@angular/fire/app";
import { provideMessaging } from "@angular/fire/messaging";
import { initializeApp as firebaseInitializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { environment } from "src/environments/environment";
import { ChatModule } from "@progress/kendo-angular-conversational-ui";
import { PopupModule } from "@progress/kendo-angular-popup";
import { LanguageService } from '@app/services/language.service';

import "hammerjs";
import { TokenInterceptorService } from "./interceptors/token-interceptor.service";
import { AuthService } from "./services/auth.service";
import { LocaleService } from "./shared/services/locale.service";

const initializeApp = (authService: AuthService) => {
  return () => authService.init();
};
const initializeLanguage = (languageService: LanguageService) => {
  return () => languageService.initializeLanguage();
}

const initializeLocale = (localeService: LocaleService) => {
  return (): Promise<any> => {
    // Initialize the locale based on some logic, for example, user preference
    const userLocale = 'it-IT'; // This could be fetched from a user profile or settings
    localeService.setLocale(userLocale);
    return Promise.resolve();
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    InputsModule,
    IntlModule,
    ...(environment.firebase.projectId && environment.firebase.apiKey
      ? [
          provideFirebaseApp(() => firebaseInitializeApp(environment.firebase)),
          provideMessaging(() => getMessaging()),
        ]
      : []),
    ChatModule,
    PopupModule,
  ],
  providers: [
    CldrIntlService,
    {
      provide: IntlService,
      useExisting: CldrIntlService,
    },
    {
      provide: LOCALE_ID,
      useValue: "it-IT",
      useFactory: (localeService: LocaleService) => localeService.localeId,
      deps: [LocaleService]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeLanguage,
      deps: [LanguageService],
      multi: true,
    },
    LocaleService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeLocale,
      deps: [LocaleService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
