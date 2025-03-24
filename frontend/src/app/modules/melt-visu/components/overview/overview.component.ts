import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { CommonService } from "src/app/shared/services/common.service";
import { MeltVisuService } from "src/app/modules/melt-visu/service/melt-visu.service";

import { GridProperty } from "src/app/shared/classes/grid-property";
import { GridColumn } from "src/app/shared/models/grid-column.model";
import { ToolbarConfig } from "src/app/shared/models/toolbar-config";
import { DateRange } from "src/app/shared/types/date-range.type";

import { MaterialConsumption } from "src/app/models/material-consumption";

import { DateRangeComponent } from "src/app/shared/components/kendo/date-range/date-range.component";

@Component({
  selector: "app-melt-visu-overview",
  templateUrl: "./overview.component.html",
  styleUrls: ["./overview.component.scss"],
})
export class OverviewComponent extends GridProperty implements OnInit {
  @ViewChild(DateRangeComponent) dateRangeComponent!: DateRangeComponent;

  public isWindowLoaderEnabled: boolean = false;
  public isLoaderEnabled: boolean = false;

  public columns: GridColumn[] = this.meltVisuService.getMeltingHistoryGridColumns();

  private unsubscribe$: Subject<void> = new Subject<void>();

  public toolbarConfig: ToolbarConfig = {
    title: $localize`History`,
		hasSearch: true
  };

  public editView: {} = {
    custom: true,
    routeLink: this.meltVisuService.editNavigation
  };

  constructor(
    _commonService: CommonService,
    public meltVisuService: MeltVisuService,
    public router: Router,
  ) {
    super(_commonService);
  }

  public closeDatePicker(event: DateRange): void {
    this.url = this.meltVisuService.getMaterialConsumptionFetchUrl(true, event);
    this.sendRequest();
  }

  ngOnInit(): void {
    this.initialFetch();
  }

  private initialFetch(): void {
    this.state.take = 20;
    this.url = this.meltVisuService.getMaterialConsumptionFetchUrl();
    this.sendRequest();
  }

  // TODO: Add grid columns filters later on.
  public reset(): void {
    this.initialFetch();
    this.dateRangeComponent.resetRange();
  }

  public deleteDataItem(item: MaterialConsumption): void {
    this.onRemoveItem(`${this.meltVisuService.baseQueryString}/${item?.id}`);
  }

  public navigateToEntryPage(): void {
    this.router.navigate([this.meltVisuService.entryNavigationPath]);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
