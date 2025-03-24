import { HttpClient, HttpHeaders  } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { environment } from "src/environments/environment";

@Injectable({
	providedIn: 'root'
})
export class MPV9Service {

    /**
	 * constructor function
	 * @param http 
	 */
	public mpLink: String = environment.mpSrvLink;

	constructor(private http: HttpClient) { }

    getProjectID(param: string) {
		let url = this.mpLink+"/project_visu/php/get_nextid.php?year="+param;
		return this.http
			.get(`${url}`, {headers:{skip:'true'}});
	}

	saveProject(data:any){
		let url = this.mpLink+"/project_visu/php/insert_update_commessa.php";
		return this.http
			.post(`${url}`,data);
	}

}