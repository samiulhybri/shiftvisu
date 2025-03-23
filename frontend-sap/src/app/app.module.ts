import { APP_INITIALIZER, NgModule, isDevMode } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HomePageComponent } from "./modules/home-page/home-page.component";
import { CommonService } from "./shared/services/common.service";
import { PlanvisuComponent } from "./modules/planvisu/planvisu.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ModuleCardComponent } from "@app/modules/home-page/module-card/module-card.component";
import { ConfigService } from "@app/shared/services/config.service";
import { firstValueFrom } from "rxjs";
import { Ui5WebcomponentsIconsModule } from "@ui5/webcomponents-ngx";
import { SharedModule } from "./shared/shared.module";
import { ServiceWorkerModule } from "@angular/service-worker";
import { AccessDeniedComponent } from '@app/modules/home-page/access-denied/access-denied.component';

// Load the configuration files
export function initializeApp(configService: ConfigService) {
	return (): Promise<any> => {
		return firstValueFrom(configService.loadConfig());
	};
}

@NgModule({
	declarations: [
		AppComponent,
		HomePageComponent,
		PlanvisuComponent,
		ModuleCardComponent,
  		AccessDeniedComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		CommonModule,
		SharedModule,
		Ui5WebcomponentsIconsModule.forRoot(["sap-icons", "tnt-icons", "business-suite-icons"]),
		ServiceWorkerModule.register("ngsw-worker.js", {
			enabled: !isDevMode(),
			// Register the ServiceWorker as soon as the application is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: "registerWhenStable:30000",
		}),
	],
	providers: [
		CommonService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: CommonService,
			multi: true,
		},
		ConfigService,
		{
			provide: APP_INITIALIZER,
			useFactory: initializeApp,
			deps: [ConfigService],
			multi: true,
		},
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
