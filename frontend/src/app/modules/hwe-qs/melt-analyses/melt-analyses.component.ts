import { Component } from '@angular/core';
import { GridProperty } from "@shared/classes/grid-property";
import { PtNormDetailsComponent } from "@app/modules/hwe-qs/pt-norms/pt-norm-details/pt-norm-details.component";
import { CommonService } from "@shared/services/common.service";
import { GridColumn } from "@shared/models/grid-column.model";
import {
    MeltAnalysisDetailsComponent
} from "@app/modules/hwe-qs/melt-analyses/melt-analysis-details/melt-analysis-details.component";
import { GridDataResult } from "@progress/kendo-angular-grid";
import { HweMeltRadioactivityTypesClass } from '../enums/HweMeltRadioactivityTypes';

@Component({
    selector: 'app-melt-analyses',
    templateUrl: './melt-analyses.component.html',
    styleUrls: ['./melt-analyses.component.scss']
})
export class MeltAnalysesComponent extends GridProperty {
    public columns = this.getColumns();
    public editView = {
        hasEditCommand: false,
    };
    public toolbarConfig = {
        title: $localize`Melt Analysis`,
        hasAddCommand: false,
        hasSearch: true
    }
    public addWindowEvent!: Event;

    constructor(_commonService: CommonService) {
        super(_commonService)
        this.url = `HweMeltAnalyses?$expand=item($expand=hweClassificationBlockGeometrie(select=value_string),hweClassificationBlockTyp(select=value_string),hweClassificationGiesstyp(select=value_string),hweClassificationLieferant(select=value_string),hweClassificationNormt(select=value_string),hweClassificationLieferantnr(select=value_string)),materialAnalysis&orderby=id desc`;
        this.sendRequest();
    }

    deleteDataItem(dataItem: any) {
        this.onRemoveItem(`HweMeltAnalyses(${dataItem.id})`)
    }
    public override sendRequest(urlFilter?: string): void {
        this.isLoadedEnabled = true;
        this._commonService.getLodata(this.state, this.url, urlFilter).subscribe({
            next: (response: GridDataResult) => {
                response.data.map((data: any) => {
                    if (data.item?.hweClassificationGiesstyp) data.item.hweClassificationGiesstyp = data.item?.hweClassificationGiesstyp[0]?.value_string ?? null
                    if (data.item?.hweClassificationLieferant) data.item.hweClassificationLieferant = data.item?.hweClassificationLieferant[0]?.value_string ?? null
                    if (data.item?.hweClassificationBlockTyp) data.item.hweClassificationBlockTyp = data.item?.hweClassificationBlockTyp[0]?.value_string ?? null
                    if (data.item?.hweClassificationBlockGeometrie) data.item.hweClassificationBlockGeometrie = data.item?.hweClassificationBlockGeometrie[0]?.value_string ?? null
                    if (data.item?.hweClassificationNormt) data.item.hweClassificationNormt = data.item?.hweClassificationNormt[0]?.value_string ?? null
                    if (data.item?.hweClassificationLieferantnr) data.item.hweClassificationLieferantnr = data.item?.hweClassificationLieferantnr[0]?.value_string ?? null
                    return data;
                })

                this.gridItems = response;
                this.isLoadedEnabled = false;
            },
            error: (e) => this.isLoadedEnabled = false
        });
    }
    getColumns(): GridColumn[] {
        return [
            {
                name: "custom_id",
                title: $localize`Melting number`,
                filterable: true
            },
            {
                name: "materialAnalysis.custom_id",
                title: $localize`Material Analysis Name`,
                filterable: true,
                filterType: 'multiLayer'
            },
            {
                name: "item.hweClassificationLieferant",
                title: $localize`Supplier Name`,
                filterable: true,
                filterType: 'multiLayer'
            },
            {
                name: "item.custom_id",
                title: $localize`Item Number`,
                filterable: true,
                filterType: 'multiLayer'
            },
            {
                name: "item.hweClassificationLieferantnr",
                title: $localize`Material Number`,
                filterable: true,
                filterType: 'multiLayer'
            },
            {
                name: "item.hweClassificationGiesstyp",
                title: $localize`Casting Type`,
                filterable: true,
                filterType: 'multiLayer'
            },
            {
                name: "item.hweClassificationNormt",
                title: $localize`Material Name`,
                filterable: true,
                filterType: 'multiLayer'
            },
            {
                name: "item.hweClassificationBlockGeometrie",
                title: $localize`Blockformat`,
                filterable: true,
                filterType: 'multiLayer'
            },
            {
                name: "delivery_specification",
                title: $localize`Delivery Specification`,
                filterable: true,
            }, {
                name: "year",
                title: $localize`Year`,
                filterable: true,
            },
            {
                name: "radioactivity",
                title: $localize`Radioactivity`,
                filterable: true,
				filterType: 'enum',
				isCustomCell: true,
                dropdownList: HweMeltRadioactivityTypesClass.getEnumArray(),
				dropdownFilterableList: HweMeltRadioactivityTypesClass.getEnumArray(),
            },
        ]
    }

    getEnumTranslateGrid(column: string, data: String) {
		var transEnum: String = '';
		if (column == 'radioactivity') {
			transEnum = HweMeltRadioactivityTypesClass.getStateTranslate(data);
		} 

		return transEnum;
	}
}