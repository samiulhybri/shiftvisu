import { PermissionEnum } from "@app/shared/enums/PermissionEnum";

export interface ISideNavItem {
  title: string;
  route: string;
  id: string;
  permission: PermissionEnum;
  icon?: string;
  sortOrder: number;
  docSection?: any;
}
