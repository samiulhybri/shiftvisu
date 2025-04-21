import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ODataBatchCall } from '@app/shared/models/odata-batch-call';
import { PlanVisuWorkingDaysSettings } from '@app/shared/models/plan_visu_working_days_settings.model';
import { Setting } from '@app/shared/models/setting.model';
import { CommonService } from '@app/shared/services/common.service';
import { ToastService } from '@app/shared/services/toaster.service';

@Component({
    selector: 'app-general',
    templateUrl: './general.component.html',
    styleUrl: './general.component.css'
})
export class GeneralComponent implements OnInit {
    @Input() public divHeight!: string;
    @Output() planvisuGeneralSectionLoaded = new EventEmitter<Setting[]>();

    switchValue?: boolean = false;
    planvisuGeneralSection: Setting[] = [];
    public weekDays: PlanVisuWorkingDaysSettings[] = [];
    public isLoading: boolean = false;
    public filterList: any[] = [
        { 'name': 'customer', 'text': $localize`Customers`, 'is_selected': false },
        { 'name': 'hall', 'text': $localize`Halls`, 'is_selected': true },
        { 'name': 'machine_group', 'text': $localize`Machine Group`, 'is_selected': true },
        { 'name': 'machine', 'text': $localize`Machines`, 'is_selected': true },
        { 'name': 'item', 'text': $localize`Item`, 'is_selected': true },
        { 'name': 'prod_order', 'text': $localize`Prod Order`, 'is_selected': true },
    ];
    public operationFieldsList: any[] = [
        { 'name': 'customer', 'text': $localize`Customer`, 'is_selected': true },
        { 'name': 'item', 'text': $localize`Item`, 'is_selected': true },
        { 'name': 'prod_order', 'text': $localize`Prod Order`, 'is_selected': true },
        { 'name': 'due_date', 'text': $localize`Due Date`, 'is_selected': true },
        { 'name': 'release_date', 'text': $localize`Release Date`, 'is_selected': true },
        { 'name': 'constraint_type', 'text': $localize`Constraint Type`, 'is_selected': true },
        { 'name': 'alt_machine', 'text': $localize`Alternative Machines`, 'is_selected': true },
    ];

    constructor(public commonService: CommonService,
        protected _toastSrv: ToastService,
    ) { }

    async ngOnInit() {
        this.isLoading = true;
        await this.loadData();
        await this.loadWorkingDayData();
    }

    async loadData() {
        this.commonService.get(`/Settings`).subscribe({
            next: async (res: any) => {
                res.value.map((data: any) => {
                    this.planvisuGeneralSection.push(new Setting().deserialize(data))
                });

                await this.setFilterDetails();
                await this.setOperationDetails();
                this.planvisuGeneralSectionLoaded.emit(this.planvisuGeneralSection);
            },
            error: err => {
                console.error(err);
            },
        });
    }

    async setFilterDetails() {
        this.filterList.forEach((elm: any) => {
            switch(elm.name) {
                case 'customer': 
                    elm.is_selected = this.planvisuGeneralSection.length > 0
                        ? this.planvisuGeneralSection[0]?.show_customer
                        : false;
                    break;
                case 'hall': 
                    elm.is_selected = this.planvisuGeneralSection.length > 0
                        ? this.planvisuGeneralSection[0]?.show_filter_hall
                        : false;
                    break;
                case 'machine_group':
                    elm.is_selected = this.planvisuGeneralSection.length > 0
                        ? this.planvisuGeneralSection[0]?.show_filter_machine_group
                        : false;
                    break;
                case 'machine':
                    elm.is_selected = this.planvisuGeneralSection.length > 0
                        ? this.planvisuGeneralSection[0]?.show_filter_machine
                        : false;
                    break;
                case 'item':
                    elm.is_selected = this.planvisuGeneralSection.length > 0
                        ? this.planvisuGeneralSection[0]?.show_filter_item
                        : false;
                    break;
                case 'prod_order':
                    elm.is_selected = this.planvisuGeneralSection.length > 0
                        ? this.planvisuGeneralSection[0]?.show_filter_prod_order
                        : false;
                    break;
                default:
                    break;
            }
        });
    }

    async setOperationDetails() {
        this.operationFieldsList.forEach((elm: any) => {
            switch(elm.name) {
                case 'customer': 
                    elm.is_selected = this.planvisuGeneralSection.length > 0
                        ? this.planvisuGeneralSection[0]?.show_op_customer
                        : false;
                    break;
                case 'item': 
                    elm.is_selected = this.planvisuGeneralSection.length > 0
                        ? this.planvisuGeneralSection[0]?.show_op_item
                        : false;
                    break;
                case 'prod_order':
                    elm.is_selected = this.planvisuGeneralSection.length > 0
                        ? this.planvisuGeneralSection[0]?.show_op_prod_order
                        : false;
                    break;
                case 'due_date':
                    elm.is_selected = this.planvisuGeneralSection.length > 0
                        ? this.planvisuGeneralSection[0]?.show_op_due_date
                        : false;
                    break;
                case 'release_date':
                    elm.is_selected = this.planvisuGeneralSection.length > 0
                        ? this.planvisuGeneralSection[0]?.show_op_release_date
                        : false;
                    break;
                case 'constraint_type':
                    elm.is_selected = this.planvisuGeneralSection.length > 0
                        ? this.planvisuGeneralSection[0]?.show_op_constraint_type
                        : false;
                    break;
                case 'alt_machine':
                    elm.is_selected = this.planvisuGeneralSection.length > 0
                        ? this.planvisuGeneralSection[0]?.show_op_alt_machine
                        : false;
                    break;
                default:
                    break;
            }
        });
    }

    async loadWorkingDayData() {
        this.commonService.get(`/PlanVisuWorkingDaysSettings`).subscribe({
            next: (res: any) => {
                res.value.map((data: any) => {
                    this.weekDays.push(new PlanVisuWorkingDaysSettings().deserialize(data))
                });
                this.isLoading = false;
            },
            error: err => {
                console.error(err);
                this.isLoading = false;
            },
        });
    }

    toggleSwitch(type: string, index: number, event: any) {
        switch(type) {
            case 'working_days':
                this.weekDays[index].is_working_day = event.target.checked;
                break;
            case 'filters':
                this.filterList[index].is_selected = event.target.checked;
                break;
            case 'operation_details':
                this.operationFieldsList[index].is_selected = event.target.checked;
                break;
            default:
                break;
        }
    }
    
    saveWeekDays() {
        this.isLoading = true;
        let requests: ODataBatchCall[] = [];

        this.weekDays.forEach((elm: any) => {
            let call = new ODataBatchCall(
                requests.length,
                "put",
                `\/odata\/PlanVisuWorkingDaysSettings(${elm.id})`
            );
            call.body = {
                is_working_day: elm.is_working_day
            };
            requests.push(call);
        });
        this.commonService["post"]("$batch", {
            requests: requests,
        }).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                this._toastSrv.showToast($localize`Week days are updated successfully!`, "success");
            },
            error: (e: any) => {
                console.error("Error saving ProdOrderPosOperations: ", e); 
                this.isLoading = false;
                this._toastSrv.showToast($localize`Something went wrong!`, "error");
            },
        });
    }

    saveFilters() {
        const payload: any = {};
        this.filterList.forEach((elm: any) => {
            let key: string = elm.name == 'customer' ? `show_${elm.name}` : `show_filter_${elm.name}`;
            payload[key] = elm.is_selected;
        });
        
        this.commonService["put"](`/Settings(${this.planvisuGeneralSection[0].id})`, payload).subscribe({
            next: (response) => {
                this._toastSrv.showToast($localize`Gantt filters are updated successfully!`, "success");
            },
            error: (e: any) => {
                console.error("Error saving Setting filters: ", e); 
                this._toastSrv.showToast($localize`Something went wrong!`, "error");
            },
        })
    }

    saveOpDetailsOptions() {
        const payload: any = {};
        this.operationFieldsList.forEach((elm: any) => {
            payload[`show_op_${elm.name}`] = elm.is_selected;
        });
        
        this.commonService["put"](`/Settings(${this.planvisuGeneralSection[0].id})`, payload).subscribe({
            next: (response) => { 
                this._toastSrv.showToast($localize`Operation details pop-up are updated successfully!`, "success");
            },
            error: (e: any) => {
                console.error("Error saving Setting operation details: ", e); 
                this._toastSrv.showToast($localize`Something went wrong!`, "error");
            },
        })
    }
}
