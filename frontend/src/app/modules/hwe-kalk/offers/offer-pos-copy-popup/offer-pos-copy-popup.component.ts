import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { GridProperty } from "@shared/classes/grid-property";
import { PermissionEnum } from "@app/enums/permissions-enum";
import { CommonService } from "@shared/services/common.service";
import { Notification } from "@shared/services/notification.service";
import { GridColumn } from "@shared/models/grid-column.model";
import { OfferPos } from "@app/models/offer-pos";
import { OfferPosProductTypeClass } from "@app/modules/hwe-kalk/enums/OfferPosProductType";
import { RowClassArgs} from "@progress/kendo-angular-grid";
import { CalculationHeatTreatmentTypeClass } from "@app/modules/hwe-kalk/enums/CalculationHeatTreatmentType";
import {process} from "@progress/kendo-data-query";
import { Subscription } from "rxjs";
import { GridComponent } from "@shared/components/kendo/grid/grid.component";
import {Event} from "@angular/router";

@Component({
    selector: 'app-offer-pos-copy-popup',
    templateUrl: './offer-pos-copy-popup.component.html',
    styleUrls: ['./offer-pos-copy-popup.component.scss']
})
export class OfferPosCopyPopupComponent extends GridProperty implements  OnDestroy, OnInit{
    public permissionEnum = PermissionEnum
    public subscription  !: Subscription;
    public searchValue  : string='';
    public gridView?: any[];
    public isHitUrl = false
    @Input() fetchUrl!: string;
    @Input() offerPos!: OfferPos;
    @Input() payload!: any;
    @Input() customUrl: boolean = false;
    @Output() copyOfferPoseEmitter = new EventEmitter<any>();
    public editView = {
        modalWidth: "95vw",
        hasRemoveCommand: false,
        hasEditCommandIcon: false,
        isCustomizedHandler: true,
        isOnPageFilter: true,
        showCloseButton: false,
        hasEditCommand: false,
        isHiddenActionColumn: false,
    };
    public columns = this.getColumns();
    public toolbarConfig = {
        title: '',
        hasAddCommand: false,
        hasSearch: true
    }
    constructor(_commonService: CommonService,
        public _notification: Notification,

    ) {
        super(_commonService)
    }
    @ViewChild("gridTale") gridTale!: GridComponent;
    ngOnInit(): void {
        this.state.take = 100000
        this.url = this.fetchUrl;
        this.sendRequest()
    }
    override sendRequest() {
        if(this.isHitUrl) {
            this.isLoadedEnabled = false;
            return
        }
        this.isHitUrl = true
        let getUrl = this.url;
        this.isLoadedEnabled = true;
        let getData = this.customUrl ? this._commonService.post(getUrl, this.payload, false) : this._commonService.get(getUrl);

        this.subscription =  getData.subscribe({
            next: (response: any) => {
                let result: any;
                if (this.customUrl) result = response.offerPos
                else result = response.value

                result = result.map((value: any) => {
                    return {
                        ...value,
                        type: value?.calculation?.heatTreatmentPosTen?.type ?? null,
                        request_date: value?.offer?.request_date ?? null,
                        is_commission: value?.is_commission ? 1 : 0,
                    };
                });
                this.gridItems = result;
                this.gridView = this.gridItems
                this.isLoadedEnabled = false;
            },
            error: (e) => this.isLoadedEnabled = false
        })
    }
    getColumns(): GridColumn[] {
        return [
            {
                name: "offer.custom_id",
                title: $localize`Offer`,
                filterable: true,
            },
            {
                name: "pos",
                title: $localize`Pos`,
                filterable: true
            },
            {
                name: "customer_material_number",
                title: $localize`Customer Material Number `,
                filterable: true
            },
            {
                name: "calculation.text_final_dimensions",
                title: $localize`Text Final Dimensions`,
                filterable: true,
            },
            {
                name: "item_name",
                title: $localize`Item Name`,
                filterable: true
            },
            {
                name: "quantity",
                title: $localize`Quantity`,
                filterable: true
            },
            {
                name: "product_type",
                title: $localize`Product Type`,
                filterType: 'enum',
                dropdownList: OfferPosProductTypeClass.getEnumArray(),
                dropdownFilterableList: OfferPosProductTypeClass.getEnumArray(),
                isCustomCell: true,
                filterable: true,
                hideColumnMenu: true
            },
            {
                title: "Material",
                name: $localize`material.custom_id`,
                filterable: true,
            },
            {
                title: "Heat treatment ",
                name: $localize`type`,
                filterable: true,
                filterType: 'enum',
                dropdownList: CalculationHeatTreatmentTypeClass.getEnumArray(),
                dropdownFilterableList: CalculationHeatTreatmentTypeClass.getEnumArray(),
                isCustomCell: true,
                hideColumnMenu: true
            },
            {
                name: "request_date",
                title: $localize`Request Date`,
                filterType: "date",
            },
            {
                name: "is_commission",
                title: $localize`Is Commissioned`,
                filterable: true,
                booleanValue: true
            }
        ]
    }

    getEnumTranslateGrid(column: string, data: String) {
        let transEnum: String = '';
        if (column == 'product_type') {
            transEnum = OfferPosProductTypeClass.getStateTranslate(data);
        } else if (column == 'heat_treatment') {
            transEnum = CalculationHeatTreatmentTypeClass.getStateTranslate(data);
        }
        return transEnum;
    }
    copyOfferPosData(data: OfferPos) {
        this.copyOfferPoseEmitter.emit(data);
    }

    public rowCallback = (context: RowClassArgs) => {
        if (this.offerPos.offer_pos_id_copy_from === context.dataItem.id) {
            return { 'bold-text': true };
        }
        return { 'bold-text': false };
    };
    ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
    }
    onPageFilter(value:Event): void {
        let filterFields: any = [];
        this.columns.map((column: any) => {
            let filter = {
                field: column.name,
                operator: "contains",
                value: this.searchValue,
            }
            filterFields.push(filter)
        })
        this.gridView = process(this.gridItems, {
            filter: {
                logic: "or",
                filters: [
                    ...filterFields
                ],
            },
        }).data;

        this.state.skip = 0;
    }
}
