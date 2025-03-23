import { Component, Input } from '@angular/core';
import { HweMeltAnalysis } from "@app/models/hwe-melt-analysis";
import { CommonService } from "@shared/services/common.service";
import { Item } from "@app/models/item";
import { Supplier } from "@app/models/supplier";
import { ODataBatchCall } from "@app/models/odata-batch-call";
import { ComboFilter } from "@shared/classes/combo-filter";
import { HweMeltTypeClass } from "@app/modules/hwe-qs/enums/HweMeltType";
import { HweMeltRadioactivityTypesClass } from '@app/modules/hwe-qs/enums/HweMeltRadioactivityTypes';
import { MaterialAnalysis } from '@app/models/material-analysis';
import { HweMeltQualityTypesClass } from '@app/modules/hwe-qs/enums/HweMeltQualityTypes';

@Component({
    selector: 'app-melt-analysis-details-header',
    templateUrl: './melt-analysis-details-header.component.html',
    styleUrls: ['./melt-analysis-details-header.component.scss']
})
export class MeltAnalysisDetailsHeaderComponent {
    @Input() meltAnalysis?: HweMeltAnalysis
    public hweMeltTypes: any[] = [];
    public hweRadioactivityTypes: any[] = [];
    public hweMeltQualityTypes: any[] = [];
    selectedItem: any;
    items: {
        hwe_block_type: string | null;
        hwe_cast_type: string | null;
        hwe_supplier_name: string | null;
        hwe_block_geometry: string | null;
        hwe_material_name: string | null;
        custom_id: any;
        id: any;
    }[] = [];
    suppliers: Supplier[] = [];
    materialAnalysisList: MaterialAnalysis[] = [];
    cmbItems: any;
    cmbMaterialAnalysis: any;
    public isLoaderEnabled: boolean = false;

    constructor(public _commonService: CommonService) {
    }

    ngOnChanges(change: any) {
        if(change.meltAnalysis) this.meltAnalysis  = change.meltAnalysis.currentValue;
    }

    async ngOnInit(): Promise<any> {
        await this.getListOfDropDown();
        this.hweMeltTypes = HweMeltTypeClass.getEnumArray();
        this.hweRadioactivityTypes = HweMeltRadioactivityTypesClass.getEnumArray();
        this.hweMeltQualityTypes = HweMeltQualityTypesClass.getEnumArray();

        if (!this.meltAnalysis?.id) {
            await this.getCustomId();
        } else {
            if (this.meltAnalysis.item) {
                const item = this.meltAnalysis.item as any
                const selectedItem: any = {}
                selectedItem['hwe_cast_type'] = item.hweClassificationGiesstyp[0]?.value_string ?? null;
                selectedItem['hwe_supplier_name'] = item?.hweClassificationLieferant[0]?.value_string ?? null;
                selectedItem['hwe_supplier_no'] = item?.hweClassificationLieferantnr[0]?.value_string ?? null;
                selectedItem['hwe_block_type'] = item?.hweClassificationBlockTyp[0]?.value_string ?? null;
                selectedItem['hwe_block_geometry'] = item?.hweClassificationBlockGeometrie[0]?.value_string ?? null;
                selectedItem['hwe_material_name'] = item?.hwe_norm_name ?? null;
                this.selectedItem = selectedItem
            }
        }
    }

    async getCustomId() {
        this.isLoaderEnabled = true;
        let value = await this._commonService.getEntity('HweMeltAnalysis')
            .catch(() => false)

        if (value) {
            this.meltAnalysis!.custom_id = value
        }
        this.isLoaderEnabled = false;
    }

    async getListOfDropDown(): Promise<any> {
        this.isLoaderEnabled = true;
        const odataBatchCalls = [
            new ODataBatchCall(0, 'get', `/odata/Items?top=10000000&$expand=hweClassificationBlockGeometrie(select=value_string),hweClassificationBlockTyp(select=value_string),hweClassificationGiesstyp(select=value_string),hweClassificationLieferant(select=value_string),hweClassificationLieferantnr(select=value_string)&select=id,custom_id,hwe_norm_name,name&filter=startswith(custom_id, '1') or startswith(custom_id, '2')`),
            new ODataBatchCall(1, 'get', `/odata/MaterialAnalyses?top=10000000`)
        ];

        this._commonService.post('$batch', { requests: odataBatchCalls }).subscribe({
            next: (response: any) => {
                if (response && response.responses) {
                    this.handleItemsResponse(response.responses[0].body.value);
                    this.handleMaterialAnalysisResponse(response.responses[1].body.value);
                    this.isLoaderEnabled = false;
                }
            },
            error: (err: any) => {
                console.error('Failed to fetch dropdown data', err);
                this.isLoaderEnabled = false;
            }
        });
    }

    private handleItemsResponse(itemsData: any[]) {
        this.items = itemsData.map((data: any) => ({
            id: data.id,
            custom_id: data.custom_id,
            hwe_cast_type: data.hweClassificationGiesstyp[0]?.value_string ?? null,
            hwe_supplier_name: data.hweClassificationLieferant[0]?.value_string ?? null,
            hwe_supplier_no: data.hweClassificationLieferantnr[0]?.value_string ?? null,
            hwe_block_type: data.hweClassificationBlockTyp[0]?.value_string ?? null,
            hwe_block_geometry: data.hweClassificationBlockGeometrie[0]?.value_string ?? null,
            hwe_material_name: data?.hwe_norm_name ?? null,
        }));

        this.cmbItems = new ComboFilter(this.items);
    }

    private handleMaterialAnalysisResponse(data: any[]) {
        this.materialAnalysisList = data;
        this.cmbMaterialAnalysis = new ComboFilter(this.materialAnalysisList);
    }

    onValueChange(data: any, field: string) {
        switch(field) {
            case 'item': 
                this.selectedItem = data;
                break;
            default:
                break;
        }
    }

    handleFilter(value: String, src: String) {
        switch (src) {
            case "item":
                this.items =
                    this.cmbItems.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
            case "material_analysis":
                this.suppliers =
                    this.cmbMaterialAnalysis.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
        }
    }
}
