import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {IntlService} from "@progress/kendo-angular-intl";
import {GENERAL_SETTING} from '@app/shared/setting/general-setting'
import {Base} from 'src/app/shared/classes/base';
import {AuthService} from "@app/services/auth.service";
import {PermissionEnum} from "@app/enums/permissions-enum";
import { HweKalkService } from './hwe-kalk.service';

@Component({
    selector: 'app-hwe-kalk',
    templateUrl: './hwe-kalk.component.html',
    styleUrls: ['./hwe-kalk.component.scss']
})
export class HweKalkComponent extends Base {
    sidebarMenu = this.getSidebar();
    public headerFirstTitle = 'hwe'
    public headerSecondTitle = 'kalk'
    public setting = GENERAL_SETTING;

    constructor(protected router: Router,
                intlService: IntlService,
                protected authService: AuthService,
                public hweService: HweKalkService,
    ) {
        super(intlService)
    }

    /**
     * Return route with necessary information
     * @returns
     */
    getSidebar() {
        const sidebarData = [
            {
                id: 0,
                text: $localize`Sales Opportunities`,
                path: '/hwe-kalk/sales-opportunity',
                icon: 'k-i-menu',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_SALES_OPPORTUNITIES_VIEW)

            }, {
                id: 1,
                text: $localize`Offers`,
                path: '/hwe-kalk/offers',
                icon: 'k-i-menu',
                isParent: true,
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_OFFER_VIEW)
            },
            {
                id: 2,
                parentId: 1,
                text: $localize`Techincal Assessment`,
                path: '/hwe-kalk/offers/techincal-assessment',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_TECHINCAL_ASSESSMENT_VIEW)
            },


            {
                id: 3,
                parentId: 1,
                text: $localize`Calc`,
                path: '/hwe-kalk/offers/calc',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_CALC_VIEW)
            }, {
                id: 4,
                parentId: 1,
                text: $localize`Calc Mechanic`,
                path: '/hwe-kalk/offers/calc-mechanic',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_CALC_MECHANIC_VIEW)
            },
            {
                id: 5,
                parentId: 1,
                text: $localize`Obtain External Quote`,
                path: '/hwe-kalk/offers/obtain-external-quote',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_OBTAIN_EXTERNAL_VIEW)
            },
            {
                id: 6,
                parentId: 1,
                text: $localize`Quotation Creation`,
                path: '/hwe-kalk/offers/quotation-creation',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_QUOTATION_CREATION_VIEW)
            },
            {
                id: 7,
                text: $localize`Assessment/QA`,
                icon: 'k-i-menu',
                isParent: true,
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)
            },

            {
                id: 8,
                parentId: 7,
                text: $localize`Specifications`,
                path: '/hwe-kalk/specifications',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)
            },
            {
                id: 9,
                parentId: 7,
                text: $localize`Documentations`,
                path: '/hwe-kalk/documentations',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)
            },
            {
                id: 10,
                parentId: 7,
                text: $localize`Metallographies`,
                path: '/hwe-kalk/metallographies',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)

            },
            {
                id: 11,
                parentId: 7,
                text: $localize`Testing Scopes`,
                path: '/hwe-kalk/testing-scopes',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)
            },
            {
                id: 12,
                parentId: 7,
                text: $localize`Non Destructive Testings`,
                path: '/hwe-kalk/non-destructive-testings',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)
            },
            {
                id: 17,
                parentId: 7,
                text: $localize`Residual Material`,
                path: '/hwe-kalk/residual-materials',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)
            },
            {
                id: 18,
                text: $localize`Materials`,
                icon: 'k-i-menu',
                isParent: true,
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_MATERIALS_EDIT)
            },
            {
                id: 19,
                text: $localize`Client Orders`,
                path: '/hwe-kalk/client-orders',
                icon: 'k-i-menu',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_CLIENT_ORDER_VIEW)
            },
            {
                id: 20,
                text: $localize`Evaluations`,
                path: '/hwe-kalk/evaluations',
                icon: 'k-i-menu',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_EVALUATION_VIEW),
            },
            {
                id: 21,
                text: $localize`Material Database`,
                path: '/hwe-kalk/material-database',
                icon: 'k-i-menu',
                cssClass: 'bottom-menu',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_MATERIAL_DATABASES_EDIT)
            },
       
            {
                id: 27,
                parentId: 19,
                text: $localize`AV`,
                path: '/hwe-kalk/client-orders/AV',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_CLIENT_ORDER_RELEASED_EDIT)
            },
            {
                id: 28,
                parentId: 19,
                text: $localize`QS`,
                path: '/hwe-kalk/client-orders/QS',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_CLIENT_ORDER_HEAT_TREATMENTS_EDIT)
            },
            {
                id: 29,
                parentId: 19,
                text: $localize`Heat Treatment`,
                path: '/hwe-kalk/client-orders/HEAT_TREATMENT',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_CLIENT_ORDER_HEAT_TREATMENTS_EDIT)
            },
            {
                id: 30,
                parentId: 18,
                text: $localize`Base Materials`,
                path: '/hwe-kalk/base/materials',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_MATERIALS_EDIT)
            },
            {
                id: 31,
                parentId: 18,
                text: $localize`Hardenability range`,
                path: '/hwe-kalk/material/hardenability-ranges',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_MATERIALS_EDIT)
            },
            {
                id: 32,
                parentId: 18,
                text: $localize`Chemical Analysis`,
                path: '/hwe-kalk/material/chemical-analyses',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_MATERIALS_EDIT)
            },
            {
                id: 33,
                parentId: 18,
                text: $localize`Deformation`,
                path: '/hwe-kalk/material/deformations',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_MATERIALS_EDIT)
            },
        
            {
                id: 35,
                parentId: 7,
                text: $localize`Work Plan`,
                path: '/hwe-kalk/work-plan',
                icon: 'k-i-shape-circle',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)
            },
            {
                id: 22,
                text: $localize`Cost`,
                icon: 'k-i-menu',
                isParent: true,
                cssClass: 'bottom-menu cost',
                alignedToBottom: true,
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_COSTS_EDIT)
            },
            {
                id: 23,
                parentId: 22,
                text: $localize`Additional Costs`,
                path: '/hwe-kalk/additional-costs',
                icon: 'k-i-shape-circle',
                cssClass: 'bottom-menu cost-submenu-1',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_COSTS_EDIT)
            },
            {
                id: 24,
                parentId: 22,
                text: $localize`Ring Rolling Factors`,
                path: '/hwe-kalk/ring-rolling-factors',
                icon: 'k-i-shape-circle',
                cssClass: 'bottom-menu cost-submenu-2',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_COSTS_EDIT)
            },
            {
                id: 25,
                parentId: 22,
                text: $localize`Heat Treatment Factors`,
                path: '/hwe-kalk/heat-treatment-factors',
                icon: 'k-i-shape-circle',
                cssClass: 'bottom-menu cost-submenu-3',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_COSTS_EDIT)
            },
            {
                id: 26,
                parentId: 22,
                text: $localize`Packaging Costs`,
                path: '/hwe-kalk/packaging-costs',
                icon: 'k-i-shape-circle',
                cssClass: 'bottom-menu cost-submenu-4',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_COSTS_EDIT)
            },
            {
                id: 34,
                parentId: 22,
                text: $localize`Heat Treatment Costs`,
                path: '/hwe-kalk/heat-treatment-costs',
                icon: 'k-i-shape-circle',
                cssClass: 'bottom-menu cost-submenu-5',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_COSTS_EDIT)
            },
                {
                id: 36,
                parentId: 22,
                text: $localize`Lead Times`,
                path: '/hwe-kalk/lead-times',
                icon: 'k-i-shape-circle',
                cssClass: 'bottom-menu cost-submenu-6',
                isShow: this.isAuthorize(PermissionEnum.HWEKALK_COSTS_EDIT)
            }
        ]
        return sidebarData.filter((value:any)=> value.isShow)
    }

    isAuthorize(permission: string) {
        return !!this.authService.user.permissions?.includes(permission);
    }
}