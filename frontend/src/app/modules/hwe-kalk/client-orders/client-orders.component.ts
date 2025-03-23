import {Component, ComponentRef, ViewChild, ViewContainerRef} from '@angular/core';
import {GridProperty} from '@app/shared/classes/grid-property';
import {
    CalculationDetailsComponent
} from '@app/modules/hwe-kalk/offers/calculation-details/calculation-details.component';
import {CommonService} from '@app/shared/services/common.service';
import {HweKalkService} from '../hwe-kalk.service';
import {GridColumn} from '@app/shared/models/grid-column.model';
import {OfferPos} from '@app/models/offer-pos';
import {Notification} from '@app/shared/services/notification.service';
import {OfferPosStatus, OfferPosStatusClass} from '../enums/OfferPosStatus';
import {DialogRef, DialogService} from "@progress/kendo-angular-dialog";
import {ActivatedRoute} from '@angular/router';
import {GridDataResult} from "@progress/kendo-angular-grid";
import {ProdOrderPos} from "@app/models/prod-order-pos";

@Component({
    selector: 'app-client-orders',
    templateUrl: './client-orders.component.html',
    styleUrls: ['./client-orders.component.scss']
})
export class ClientOrdersComponent extends GridProperty {
    public isWindowLoaderEnabled: boolean = false;
    public formData: any;
    public cmpRef!: ComponentRef<any>;
    public columns: GridColumn[] = [];
    public addWindowEvent!: Event;
    public offerPosStatus = OfferPosStatus;
    public editView = {
        actionButton: "edit",
        modalTemplate: CalculationDetailsComponent,
        modalWidth: "95vw",
        isCustomizedHandler: true,
        hasRemoveCommand: false,
        showCloseButton: false,
        isHiddenActionColumn: true
    };

    public toolbarConfig = {
        title: $localize`Client Orders`,
        hasAddCommand: false,
        hasSearch: true
    }

    @ViewChild('modalBody', {read: ViewContainerRef}) modalBody!: ViewContainerRef;

    constructor(_commonService: CommonService,
                protected hweKalkService: HweKalkService,
                protected notification: Notification,
                private dialogService: DialogService,
                protected route: ActivatedRoute,
    ) {
        super(_commonService)
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (this.state.filter?.filters?.length) this.state.filter.filters = [];
            const statusParam = params['status'];
            if (statusParam === 'AV'){
                this.state.filter?.filters.push({
                    field: 'status',
                    operator: 'eq',
                    value: OfferPosStatus.AV
                })
                this.editView.isHiddenActionColumn = false
            }
            else if (statusParam === 'QS') {
                this.state.filter?.filters.push({
                    field: 'status',
                    operator: 'eq',
                    value: OfferPosStatus.QS
                })
                this.editView.isHiddenActionColumn = false
            }
            else if (statusParam === 'HEAT_TREATMENT') {
                this.state.filter?.filters.push({
                    field: 'status',
                    operator: 'eq',
                    value: OfferPosStatus.HEAT_TREATMENT
                })
                this.editView.isHiddenActionColumn = false
            }
            this.state.filter?.filters.push({field: 'is_commission', operator: 'eq', value: true})
            this.columns = this.getColumns(statusParam)
            this.setRequest()
        });

    }

    setRequest() {
        this.state.take = 50;
        this.url = `OfferPos?$expand=calculation(expand=operationPlan,prodOrderPos(select=id,prod_order_id,calculation_id,pos;expand=prodOrder(id,custom_id));select=id,offer_pos_id,sales_order,sales_order_pos),offer($expand=customer(select=id,name),salesOpportunity(select=id,custom_id);select=id,sales_opportunity_id,custom_id,customer_id)&$orderby=id desc`
        this.sendRequest();
        this.hweKalkService.onCalcUpdateSubject.subscribe((item: boolean) => {
            if (item) {
                this.sendRequest();

            }
        })
    }

    public override sendRequest(urlFilter?: string): void {
        this.isLoadedEnabled = true;
        this._commonService.getLodata(this.state, this.url, urlFilter).subscribe({
            next: (response: GridDataResult) => {
                response.data =  response.data.map((data:any)=>{
                    return {
                        ...data,
                        prod_order_pos: this.getProdOrderPos(data?.calculation?.prodOrderPos)
                    }
                })
                this.gridItems = response;
                this.isLoadedEnabled = false;
            },
            error: (e) => this.isLoadedEnabled = false
        });
    }

    getProdOrderPos(prodOrderPos:ProdOrderPos[]){
       return prodOrderPos
            ?.map((data: ProdOrderPos) => `${data.prodOrder?.custom_id}-${data.pos}`)
            ?.join(', ')
    }

    getColumns(statusParam = ''): GridColumn[] {
        return [
            {
                name: "offer.custom_id",
                title: $localize`Offer`,
                filterable: false,
                filterType: 'true'
            },
            {
                name: "offer.customer.name",
                title: $localize`Customer`,
                filterable: false,
                filterType: 'multiLayer'
            },
            {
                name: "offer.salesOpportunity.custom_id",
                title: $localize`Sales Opportunity`,
                filterable: false,
                filterType: 'multiLayer'

            },
            {
                name: "pos",
                title: $localize`Position`,
                filterable: true
            },
            {
                name: "item_name",
                title: $localize`Item Name`,
                filterable: true
            },
            {
                name: "calculation.sales_order",
                title: $localize`Sales Order`,
                filterable: true,
                filterType: 'multiLayer'
            },
            {
                name: "calculation.sales_order_pos",
                title: $localize`Sales Order Pos`,
                filterable: true,
                filterType: 'multiLayer'
            },
            {
                name: "status",
                title: $localize`Status`,
                filterable: true,
                filterType: 'enum',
                dropdownList: OfferPosStatusClass.getEnumArray(),
                dropdownFilterableList: OfferPosStatusClass.getEnumArray(),
                isCustomCell: true,
                hideColumnMenu: !!statusParam
            },

            {
                name: "prod_order_pos",
                title: $localize`Order`,
                hideColumnMenu:true

            },
        ]
    }

    openExportConfirmationDialog(dataItem: OfferPos) {
        const exportConfirmationDialog: DialogRef = this.dialogService.open({
            title: $localize`Action`,
            content: $localize`Checked?`,
            actions: [{text: $localize`Cancel`, action: "cancel"}, {
                text: $localize`Yes`,
                themeColor: "primary",
                action: "yes"
            }],
            width: 450,
            height: 200,
            minWidth: 250
        });

        exportConfirmationDialog.result.subscribe((result: any) => {
            if (result.action == "yes") this.exportOperationPlan(dataItem)
        });
    }

    exportOperationPlan(dataItem: OfferPos) {
        let payload = {
            operation_plan_id: dataItem.calculation?.operationPlan?.id,
            calculation_id: dataItem.calculation?.id,
            offer_pos_id: dataItem.id,
        }
        this.isLoadedEnabled = true;
        this._commonService.post('hwe-kalk/export-operation-plan', payload, false)
            .subscribe({
                next: (response: any) => {
                    if (response.success) {
                        this.sendRequest();
                        this.notification.showSuccess($localize`Offer-pos work plan exported succesfully`);
                    } else {
                        this.isLoadedEnabled = false;
                        this.notification.showError($localize`Something went wrong`);
                    }
                },
                error: (e) => {
                    this.isLoadedEnabled = false;
                    this.notification.showError($localize`Something went wrong`);
                }
            });
    }

    getEnumTranslateGrid(column: string, data: String) {
        let transEnum: String = '';
        if (column == 'status') {
            transEnum = OfferPosStatusClass.getStateTranslate(data);
        }
        return transEnum;
    }
}
