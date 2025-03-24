import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import { environment } from '@app/environments/environment';

var machineID = 0;
var isAutoLoginChecked = false;

export const authGuardGuard: CanActivateFn = async (route, state) => {
	const router = inject(Router);
	const authService = inject(AuthService);
	const isUserLoggedIn: boolean = (await authService.isUserLoggedIn()) as boolean;

	if (machineID == 0 && !isAutoLoginChecked && !isUserLoggedIn && environment.clientName != 'volaplast') {
		machineID = (await authService.autoLogin()) as number;
		isAutoLoginChecked = true;

		if (machineID)
			return router.navigate([`/machine-board/${machineID}`], { replaceUrl: true });
	}

	if (isUserLoggedIn) {
		return true;
	} else {
		if(environment.isV10enable || environment.isV9enable){
			 window.location.href = environment.homeLink;
			 return false;
		}else{
			return router.navigate(["/login"], { replaceUrl: true });
		}
	}
};
