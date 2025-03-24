import { PermissionEnum } from "@app/shared/enums/PermissionEnum";

export interface ISideNavItem {
    label: string;
    id: string;
    routerLink?: string;
    icon: string;
    permission: PermissionEnum;
    children?: undefined | ISideNavItem[];
    expanded?: boolean;
}