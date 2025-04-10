import { Component } from '@angular/core';
import { Localization } from "@app/shared/utils/common-localize";
@Component({
  selector: 'app-shift-visu-issue-list',
  templateUrl: './shift-visu-issue-list.component.html',
  styleUrl: './shift-visu-issue-list.component.css'
})
export class ShiftVisuIssueListComponent {
	failureDescriptionNote: string = '';
  isIssueListCollapsed: boolean = false;
  isIssueTabCollapsed: boolean = false;
  localization = Localization

    columns: any = [
      {
        Header: $localize`Error`,
        accessor: "name",
        disableFilters: false,
        disableGroupBy: true,
        disableSortBy: false,
        isSelected: true,
      },
      {
        Header: $localize`Creator`,
        accessor: "model_type",
        disableFilters: false,
        disableGroupBy: true,
        disableSortBy: false,
        isSelected: true,

      },
      {
        Header: $localize`Failure Description`,
        accessor: "component_type",
        disableFilters: false,
        disableGroupBy: true,
        disableSortBy: false,
        isSelected: true,
      },
      {
        Header: $localize`Start Date`,
        accessor: "start_date",
        disableFilters: false,
        disableGroupBy: true,
        disableSortBy: false,
        isSelected: true,
      },
      {
        Header: $localize`Attachment`,
        accessor: "attachment",
        disableFilters: false,
        disableGroupBy: true,
        disableSortBy: false,
        isSelected: true,
      },
    ];

    onCLickIssueTabCollapsed() {
      this.isIssueTabCollapsed = !this.isIssueTabCollapsed;
    }

    onCLickIssueListCollapsed() {
      this.isIssueListCollapsed = !this.isIssueListCollapsed;
    }
}
