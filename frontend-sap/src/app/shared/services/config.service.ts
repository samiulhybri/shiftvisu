import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
	providedIn: "root",
})
export class ConfigService {
	private config: any;

	constructor(private http: HttpClient) {}

	loadConfig(): Observable<any> {
		return this.http.get<any>("/assets/configs/config.json").pipe(
			map(config => {
				this.config = config;
				return config;
			}),
			catchError(error => {
				console.error(error);
				this.config = {};
				return of(this.config);
			})
		);
	}

	getConfigValue(key: any) {
		return this.config[key];
	}
}
