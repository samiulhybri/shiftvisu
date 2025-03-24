import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class MarkerRecipeService {
	private apiPrefix: string = environment.apiPrefix;

	constructor(private http: HttpClient) { }

	requestPCC(ip: any) {
		return this.http.get(`${ this.apiPrefix }/marker-recipe/request-pcc/${ ip }/data`);
	}

	sendDatatoPrinter(ip: any) {
		return this.http.get(`${ this.apiPrefix }/marker-recipe/request-pcc/${ ip }/send-data-to-printer`);
	}

	setOrderCounter(ip: any, count: number) {
		return this.http.get(`${ this.apiPrefix }/marker-recipe/request-pcc/${ ip }/set-order-counter/${ count }`);
	}

	setDayCounter(ip: any, count: number) {
		return this.http.get(`${ this.apiPrefix }/marker-recipe/request-pcc/${ ip }/set-day-counter/${ count }`);
	}
}
