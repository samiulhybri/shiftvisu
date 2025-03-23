import {
    ActivatedRouteSnapshot,
    CanActivateChildFn,
    CanActivateFn,
    Router,
    RouterStateSnapshot,
    UrlTree
} from "@angular/router";
import { AuthService } from "./services/auth.service";
import { inject } from "@angular/core";
import { environment } from 'src/environments/environment';
import { PermissionEnum } from '@app/enums/permissions-enum'
export const canActivate: CanActivateFn = async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (await authService.isLoggedIn()) {
        return true
    } else {
        window.location.href = environment.homeLink
        return false
    }
};

export const canActivateChild: CanActivateChildFn = async (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {
    const router = inject(Router);
    const result = await canActivate(route, state); // Calling canActivate function directly
    if (typeof result === 'boolean') {
        return result;
    } else {
        return router.createUrlTree([environment.homeLink]);
    }
};

export const canActivateRoute = (permissions: any) => (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    const router = inject(Router);
    const authService: AuthService = inject(AuthService);
    if (!!authService.user.permissions?.includes(permissions)) {
        return true
    } else {
        let isPermited = false;
        for (let key in hweSidebarPermissions) {
            console.log(!!authService.user.permissions?.includes(key), authService.user.permissions, key)
            if (!!authService.user.permissions?.includes(key)) {
                router.navigate([hweSidebarPermissions[key]])
                isPermited = true;
                return false;
            }
        }
        if (!isPermited) {
            router.navigate(['/'])
            return false;
        }
    }
    return false;
}

const hweSidebarPermissions: any = {
    [PermissionEnum.HWEKALK_SALES_OPPORTUNITIES_VIEW]: 'hwe-kalk/sales-opportunity',
    [PermissionEnum.HWEKALK_OFFER_VIEW]: 'hwe-kalk/offers',
    [PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT]: 'hwe-kalk/hwe-kalk/specifications',
    [PermissionEnum.HWEKALK_CLIENT_ORDER_VIEW]: 'hwe-kalk/sales-opportunity',
    [PermissionEnum.HWEKALK_MATERIALS_EDIT]: 'hwe-kalk/base/materials',
    [PermissionEnum.HWEKALK_COSTS_EDIT]: 'hwe-kalk/additional-costs',
    [PermissionEnum.HWEKALK_MATERIAL_DATABASES_EDIT]: 'hwe-kalk/material-database',
};



