import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Observable, lastValueFrom } from 'rxjs';
import { User } from '@app/models/user';
@Injectable({
	providedIn: 'root'
})
export class AuthService {
	public user!: User;
	
	constructor(
		private http: HttpClient,
		private router: Router
	) { }

	public getCurrentUserRole(): Observable<any> {
		return this.http.get<any>(`${environment.apiPrefix}/getUserByToken`);
	}

	public async init() {
		try {
			this.user = await lastValueFrom(this.http.get<any>(`${environment.apiPrefix}/getUserByToken`));
		} catch (error) {}
	}
 
    public async isLoggedIn(): Promise<boolean> {
        try {
			if(this.user.id) return true;
            this.user = await lastValueFrom(this.http.get<any>(`${environment.apiPrefix}/getUserByToken`));
            if(this.user){
                return true;
            }
            else{
                return false;
            }
        } catch (error) {
            return false;
        }
    }

	isPermissionValidate(permission:string):boolean{
		return !!this.user.permissions?.includes(permission);
	}
}
