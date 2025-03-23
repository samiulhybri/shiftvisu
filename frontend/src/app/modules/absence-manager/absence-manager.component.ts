import { Component, OnInit } from '@angular/core';
import { GENERAL_SETTING } from '@app/shared/setting/general-setting';
import { AuthService } from '@app/services/auth.service'
import { CommonService } from '@app/shared/services/common.service';
import { RequestService } from './services/request.service'
import { IntlService } from "@progress/kendo-angular-intl";
import { Base } from '@app/shared/classes/base';
import { UserTypes } from '@app/enums/user-type'
import { Title } from "@angular/platform-browser";
import { environment } from 'src/environments/environment';
@Component({
    selector: 'app-absence-manager',
    templateUrl: './absence-manager.component.html',
    styleUrls: ['./absence-manager.component.scss']
})
export class AbsenceManagerComponent extends Base implements OnInit {
    public headerFirstTitle = 'absence'
    public headerSecondTitle = 'management'
    public setting = GENERAL_SETTING;
    public sidebarMenu: any;
    public userData: any;
    public userType = UserTypes;
    public appTitle = $localize`Absence Manager`
    constructor(private authService: AuthService,
        private commonService: CommonService,
        public requestService: RequestService,
        public intlService: IntlService,
        titleService: Title
    ) {
        super(intlService);

        try {
            if (environment.clientName !== '') titleService.setTitle(environment.clientName + ' | '  + this.appTitle); 
			else titleService.setTitle(this.appTitle);
        } catch (e) { }
    }
    ngOnInit(): void {
        this.requestService.isAbsenceManagerStart = true
        this.userData = this.authService.user
        this.sidebarMenu = this.getSidebar(this.userData);
        this.commonService.gridRowdblClick = true;
    }
    getSidebar(userData: any) {
        let sidebar = [
            {
                id: 0,
                text: $localize`My Absence`,
                path: '/absence-manager/my-absence',
                imgPath: 'png/my-absence.png'

            },
            {
                id: 1,
                text: $localize`Request`,
                path: '/absence-manager/request',
                imgPath: 'png/request.png'
            }
        ]

        if (!userData.is_absence_manager_admin && userData.is_supervisor === 0) {
            sidebar.splice(1, 1);
        }

        return sidebar;
    }
    ngOnDestroy(): void {
        this.commonService.gridRowdblClick = false;
        this.requestService.isAbsenceManagerStart = false
    }
}
