import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import { inject } from "@angular/core";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";

export const userQualificationGuard: CanActivateFn = async (route, state) => {
	const authService = inject(AuthService);
	const router = inject(Router);
	const url = state.url.replace(/[0-9]/g, "");
	const isUserLoggedIn = await authService.isUserLoggedIn();
	if (!isUserLoggedIn) return false;

	if (`${url}` in urlPermissions) {
		const permissions = urlPermissions[url];
		const hasValidPermission = permissions.some((permission: PermissionEnum) =>
			authService.isPermissionValid(permission)
		);
		if (hasValidPermission) {
			return true;
		} else {
			await router.navigate(["../"]);
			return false;
		}
	}
	return true;
};

const urlPermissions: any = {
	"/machine-board//production-plan": [
		PermissionEnum.MACHINEBOARD_PRODUCTION_PLAN_VIEW,
		PermissionEnum.MACHINEBOARD_PRODUCTION_PLAN_EDIT,
		PermissionEnum.MACHINEBOARD_PRODUCTION_PLAN_EDIT_IF_QUALIFIED,
	],
	"/machine-board//machine-states": [
		PermissionEnum.MACHINEBOARD_MACHINE_STATE_CHANGE_VIEW,
		PermissionEnum.MACHINEBOARD_MACHINE_STATE_CHANGE_EDIT_IF_QUALIFIED,
	],
	"/machine-board//machine-state-history": [
		PermissionEnum.MACHINEBOARD_MACHINE_STATE_HISTORY_VIEW,
		PermissionEnum.MACHINEBOARD_MACHINE_STATE_HISTORY_EDIT_IF_QUALIFIED,
	],
	"/machine-board//quantity": [
		PermissionEnum.MACHINEBOARD_QUANTITY_EDIT,
		PermissionEnum.MACHINEBOARD_QUANTITY_EDIT_IF_QUALIFIED,
	],
	"/machine-board//material-consumption": [
		PermissionEnum.MACHINEBOARD_MATERIAL_CONSUMPTION_EDIT,
		PermissionEnum.MACHINEBOARD_MATERIAL_CONSUMPTION_EDIT_IF_QUALIFIED,
	],
	"/machine-board//packaging": [
		PermissionEnum.MACHINEBOARD_PACKAGING_EDIT,
		PermissionEnum.MACHINEBOARD_PACKAGING_EDIT_IF_QUALIFIED,
	],
	"/machine-board//quali-visu": [
		PermissionEnum.MACHINEBOARD_QUALIVISU_EDIT,
		PermissionEnum.MACHINEBOARD_QUALIVISU_EDIT_IF_QUALIFIED,
	],
	"/machine-board//doc-visu": [
		PermissionEnum.MACHINEBOARD_DOCVISU_EDIT,
		PermissionEnum.MACHINEBOARD_DOCVISU_EDIT_IF_QUALIFIED,
	],
};
