import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@app/environments/environment';
import { readCookie } from '@app/shared/helpers/read-cookie';
import { User } from '@app/shared/models/user.model';
import { AuthService } from '@app/shared/services/auth.service';
import { CommonService } from '@app/shared/services/common.service';
import { ToastService } from '@app/shared/services/toaster.service';
import moment from 'moment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import ValueState from '@ui5/webcomponents-base/dist/types/ValueState';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.css'
})
export class ReportsComponent implements AfterViewInit {
    @ViewChild('daterangePicker') daterangePicker: any;

    public reportType: string = '';
    public start: any = moment().startOf('month');
    public end: any = moment();
    public allEmployeeList: User[] = [];
    public selectedEmployee!: any;
    public isBusy: boolean = false;
    public momentInstance = moment;
    public pdfSrc: SafeResourceUrl | null = null;
    public dateRangeValue: any;
    public isDisabledGoBtn: boolean = false;
    public calenderValueState: ValueState =  ValueState.None; 

    constructor(private _authSrv: AuthService,
        private _commonSrv: CommonService,
        private router: Router,
        private route: ActivatedRoute,
        private _toasterSrv: ToastService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnChanges(change: any) {

    }

    async ngOnInit() {
        const startDate = moment().startOf('month');
        const endDate = moment();
        const dateRangeValue = startDate.local().format('DD/MM/YYYY') + ' - ' + endDate.local().format('DD/MM/YYYY');
        this.dateRangeValue = dateRangeValue;

        this.start = startDate.toISOString();
        this.end = endDate.toISOString();

        if (this.router.url == '/time-visu/report-hours-toolvisu') this.reportType = 'toolvisu';
        else if (this.router.url == '/time-visu/report-hours-employee') {
            this.reportType = 'employee';
            await this.loadEmployees();
        } else if (this.router.url == '/time-visu/report-hours-project-tasks') this.reportType = 'project_tasks';

        this.createReport();
    }

    ngAfterViewInit(): void {
        if (this.daterangePicker) this.daterangePicker.value = this.dateRangeValue;
    }

    async loadEmployees() {
        let url: string = `/Users?$select=id,custom_id,name,is_active&$filter=is_active eq true&$top=100000`;
        this._commonSrv
            .get(url)
            .subscribe({
                next: (response: any) => {
                    if (response.value) {
                        this.allEmployeeList = response.value.map((elm: User) => new User().deserialize(elm));
                    }
                },
                error: e => {
                    console.error("Error while getting Employees: ", e);
                    this._toasterSrv.showToast(
                        $localize`Data loading issue. Check log`,
                        "error"
                    );
                },
            });
    }

    onUpdateValue(data: any, field: string, isRadio: boolean = false) {
        switch (field) {
            case 'employee_report':
                var employee: any = {};
                if (data.detail) {
                    employee = this.allEmployeeList.find(
                        elm => elm.id == data.detail.item.id
                    );
                }
                break;
            default:
                break;
        }
    }

    onSelectionChange(event: any, field: string) {
        const selectedItem = event.target.value;
        if (selectedItem) {
            switch (field) {
                case 'dates':
                    const { value } = event.detail;
                    const [startDateStr, endDateStr] = value.split(' - ');

                    const startDate = moment(startDateStr, 'DD/MM/YYYY');
                    const endDate = moment(endDateStr, 'DD/MM/YYYY');

                    if (startDate.year() !== endDate.year()) {
                        this._toasterSrv.showToast($localize`Select dates from same year`, "error");
                        this.start = moment().startOf('month').toISOString();
                        this.end = moment().subtract(0, "days").toISOString();
                        this.isDisabledGoBtn = true;
                        this.calenderValueState = ValueState.Negative;
                    } else {
                        this.start = moment.utc(startDate, "DD/MM/YYYY").local().toISOString();
                        this.end = moment.utc(endDate, "DD/MM/YYYY").local().toISOString();
                        this.isDisabledGoBtn = false;
                        this.calenderValueState = ValueState.None;
                    }
                    this.dateRangeValue = moment.utc(this.start).local().format('DD/MM/YYYY') + ' - ' + moment.utc(this.end).local().format('DD/MM/YYYY');
                    break;
                case 'employee_report':
                    var employee = this.allEmployeeList.find(
                        elm => elm.name == selectedItem
                    );
                    this.selectedEmployee = employee;
                    break;
                default:
                    break;
            }
        }
    }

    createReport() {
        this.pdfSrc = null;
        let lan = readCookie('sct_language') ?? 'en';
        let client: string = environment.homeLogo;
        let url: string = '';
        let start_date = moment(this.start).format("YYYY-MM-DD");
        let end_date = moment(this.end).format("YYYY-MM-DD");
        url = this.reportType == 'toolvisu' ? `time-visu/report/tool-visu-hour/${start_date}/${end_date}/${lan}/${client}` : '';
        if (url != '') {
            this.isBusy = true;
            this._commonSrv
                .getFile(url, false)
                .subscribe({
                    next: async (response: any) => {
                        const blob = new Blob([response], { type: "application/pdf" });
                        const pdfUrl = URL.createObjectURL(blob);
                        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
                        this.isBusy = false;

                    },
                    error: (e: any) => {
                        console.log("error while getting PDF.", e);
                        this.isBusy = false;
                        this._toasterSrv.showToast($localize`Something went wrong. Please check backend logs!`, "error");
                    },
                });
        } else {
            this._toasterSrv.showToast($localize`Report is yet to be finalized!`, "informaation");
        }
    }
}
