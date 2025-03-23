import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";

export const machineGuard: CanActivateFn = async (route, state) => {
	const router = inject(Router);
	const authService = inject(AuthService);
	const matchMachineId = state.url.match(/\/machine-board\/(\d+)/);
	const machineId = matchMachineId ? matchMachineId[1] : null;
	const isValid = await authService.getAllMachines(machineId);

	if (isValid) {
		return true;
	} else {
		return router.navigate(["/403"], { replaceUrl: true });
	}
};
