import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@app/environments/environment';
import { User } from '@app/shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token?:string|null;
  private isAlreadyLoggedIn?:boolean = false;
  public hasQualifiedUsers: boolean = false;
  public totalClockedInUsers: number = 0;
  public loggedInUser: User = new User();

  constructor(private http: HttpClient,) { }

  login(userName:string, password:string) {
    const user = {
      username:userName,
      password: password
    };

    return new Promise((resolve, reject) => {
      this.http.post(`${environment.apiPrefixForRest}/login`,user).subscribe({
        next:(response: any) => {
          localStorage.setItem("LaravelToken", response?.token);
          this.token = response?.token;

          resolve("");
        },
        error:(error) => {
          console.log(error);
          if(error.status==403) {
            reject($localize`Please check the username or password is correct`);
          } else {
            reject($localize`Unable to login`);
          }
        }
      })
    });

  }

	async getLocalIP() {
		return new Promise<string[]>((resolve, reject) => {
			const ips: string[] = [];
			const pc = new RTCPeerConnection({ iceServers: [] });
			pc.createDataChannel("");

			pc.onicecandidate = async event => {
				if (event.candidate) {
					const candidate = event.candidate.candidate;
					const ipMatch = candidate.match(/(\d{1,3}(\.\d{1,3}){3})/);
					let ip;
					if (ipMatch) {
						ip = ipMatch[1];
					}
					if (ip && !ips.includes(ip)) {
						ips.push(ip);
					}
				} else {
					// When no more candidates, check if private IP was found
					if (ips.length === 0) {
						// Fetch public IP only if no private IPs found
						await fetch(`${environment.apiPrefixForRest}/user-ip`)
							.then(response => response.json())
							.then(data => {
								ips.push(data?.userIP?.[0]);
								resolve(ips); // Resolve with the public IP
							})
							.catch(error => reject(error));
					} else {
						// Resolve with the gathered private IPs
						resolve(ips);
					}
					pc.close(); // Close the connection
				}
			};

			pc.createOffer()
				.then(offer => {
					return pc.setLocalDescription(offer);
				})
				.then(() => {})
				.catch(error => {
					console.error(
						"Error during WebRTC offer creation or description setting:",
						error
					);
					reject(error);
				});
		});
	}

	public async autoLogin() {
		const ips = await this.getLocalIP();
		const ip = ips?.length ? ips[0] : null;

		if (ip) {
			return new Promise((resolve, reject) => {
				this.http.post(`${environment.apiPrefixForRest}/auto-login`, { ip }).subscribe({
					next: (response: any) => {
						localStorage.setItem("LaravelToken", response?.token);
						this.token = response?.token;
						const machineId = response.user?.machine_id || null;
						resolve(machineId);
					},
					error: () => {
						resolve(null);
					},
				});
			});
		} else return null;
	}

  isUserLoggedIn() {
    const token = this.getToken();

    return new Promise((resolve, reject) => {
      if(!token) {
        resolve(false);
        return;
      }
      if(this.isAlreadyLoggedIn) {
        resolve(true);
        return;
      }

      this.http.get(`${environment.apiPrefixForRest}/getUserByToken`,).subscribe({
        next: (response)=>{
          this.loggedInUser.deserialize(response)
          this.isAlreadyLoggedIn = true;
          resolve(true);
        },
        error:()=>{
          resolve(false);
        }
      });
    });

  }

  public getToken() {
    this.token = localStorage.getItem("LaravelToken");
    return this.token;
  }

  public logout(){
    let header:any = {
      "Cache-Control": "no-cache",
      "Authorization":`Bearer ${this.token}`,
    }

    if(environment.isV10enable){
      header.v10Token = localStorage.getItem("token") || ''      
    }

    if(environment.isV9enable){
      header.v9SessionId = 'true';
    }
    return new Promise((resolve, reject) => {
      
      this.http.get(`${environment.apiPrefixForRest}/logout`,{headers:header}).subscribe({
        next:(response: any) => {
          localStorage.removeItem("LaravelToken");
          if(environment.isV10enable) localStorage.removeItem("token");
          if(environment.isV9enable) document.cookie = "logout_initiated=true; path=/;";
          this.token = null;
          this.isAlreadyLoggedIn = false;
          resolve("");
        },
        error:(error) => {
          reject($localize`Unable to logout`);
        }
      });

    });
  }

  public getUser(){
    return this.loggedInUser;
  }

  isPermissionValid(value:string):boolean {
    for (let role of this.loggedInUser.roles) {
      for (let permission of role.permissions) {
        if (value == permission.name) {
          return true;
        }
      }
    }

    return false;
  }

  isQualified(): boolean {
    if (this.hasQualifiedUsers && this.totalClockedInUsers) return true;
    else return false;
  }

  public getAllMachines(machineId:any): Promise<any> {
    return new Promise( async (resolve, reject) => {
      const isUserLoggedIn = await this.isUserLoggedIn();
      if(!isUserLoggedIn) return resolve(false);
      this.http.get<any[]>(`${environment.apiURL}/MachineUserRestrictions?$filter=user_id eq ${this.loggedInUser.id} and machine_id eq ${machineId}`).subscribe({
        next: (response: any) => {  
          resolve(response.value.length > 0);
        },
        error:()=>{
        }
      });
    });
}
}
