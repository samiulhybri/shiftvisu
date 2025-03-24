import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { GridDataResult } from '@progress/kendo-angular-grid';
import {
	toODataString,
	translateDataSourceResultGroups,
} from "@progress/kendo-data-query";

import { Observable, lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class CommonService {
	private lodataPrefix: string = environment.lodataPrefix
	private apiPrefix: string = environment.apiPrefix
	public loading = false;
	public gridRowdblClick = false;
	private gridState: any;
	public currentModule: string = '';

	/**
	 * constructor function
	 * @param http 
	 */
	constructor(private http: HttpClient) { }

	get(url: string, isLodata: boolean = true) {
		let urlPrefix = isLodata ? this.lodataPrefix : this.apiPrefix;
		return this.http
			.get(`${urlPrefix}/${url}`);
	}

	delete(url: string, isLodata: boolean = true) {
		let urlPrefix = isLodata ? this.lodataPrefix : this.apiPrefix;
		return this.http
			.delete(`${urlPrefix}/${url}`);
	}

	put(url: string, data: any) {
		return this.http
			.put(`${this.lodataPrefix}/${url}`, data);
	}

	post(url: string, data: any, isLodata: boolean = true) {
		let urlPrefix = isLodata ? this.lodataPrefix : this.apiPrefix;
		return this.http
			.post(`${urlPrefix}/${url}`, data);
	}

	postFile(url: string, data: [], isLodata: boolean = true) {
		let urlPrefix = isLodata ? this.lodataPrefix : this.apiPrefix;
		return this.http
			.post(`${urlPrefix}/${url}`, data, { responseType: 'arraybuffer' });
	}

	/**
	 * Get all get request come from lodata 
	 * @param state State
	 * @param url 
	 * @returns  Observable
	 */
	public getLodata(state: any, url: string, multiLayerFileter?: string): Observable<GridDataResult> {
		const postStateData = {
			group: state.group,
			skip: state.skip,
			take: state.take,
			sort: state.sort,
			filter: state.filter
		};

		let queryStr = `${toODataString(postStateData)}`;
		if (multiLayerFileter && queryStr.includes('$filter')) queryStr = `${queryStr} and ${multiLayerFileter}`;
		else if (multiLayerFileter) queryStr = `$filter=${multiLayerFileter}`;

		const hasGroups = state.group && state.group.length;
		return this.http
			.get(`${this.lodataPrefix}/${url}&${queryStr}&count=true`)
			.pipe(
				map((res: any) => {
					return {
						data: hasGroups ? translateDataSourceResultGroups(res.value) : res.value,
						total: res["@count"],
					};
				})
			);
	}

	getGeneratedId(entity: string) {
		return this.http
			.get(`${this.apiPrefix}/generateId?entity=${entity}`)
			.pipe(
				map((res: any) => {
					return res.entity
				})
			)
	}

	getEntity(entity: string) {
		return lastValueFrom(this.getGeneratedId(entity))
			.catch(() => {
				return false;
			})
	}

	createLog(payload: any) {
		this.post('HweKalkLogs', payload).subscribe({
			next: (response: any) => {

			}
		})
	}

	saveGridState(state: any, module: string) {
		this.currentModule = module;
		this.gridState = state;
	}

	getGridState(module: string) {
		if(this.currentModule == module) return this.gridState;
	}

	getWithoutPrefix(url: string) {
		return this.http
			.get(`${url}`);
	}
}
