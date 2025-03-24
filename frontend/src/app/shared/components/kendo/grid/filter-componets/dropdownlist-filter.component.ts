import {
    Component,
    Input,
    Output,
    EventEmitter,
    AfterViewInit,
} from "@angular/core";

import { FilterService } from "@progress/kendo-angular-grid";
import { FilterDescriptor } from "@progress/kendo-data-query";

@Component({
    selector: "dropdownlist-filter",
    template: `
        <kendo-dropdownlist
            [value]="value"
            [valuePrimitive]="isPrimitive"
            [data]="data"
            [textField]="textField"
            [valueField]="valueField"
            (valueChange)="onValueChange($event)"
        >
        </kendo-dropdownlist>
    `,
})
export class DropDownListFilterComponent implements AfterViewInit {
    
    @Input() public isPrimitive?: boolean;
    @Input() public currentFilter: any;
    @Input() public data:any;
    @Input() public textField:any;
    @Input() public valueField:any;
    @Input() public filterService?: FilterService;
    @Input() public field?: string;
    @Output() public valueChange = new EventEmitter<number[]>();

    public currentData: any;
    public showFilter = true;
    public value?: number;

    public onValueChange(value: number): void {
        this.filterService?.filter({
            filters: [{ field: this.field, operator: "eq", value: value }],
            logic: "and",
        });
    }

    public ngAfterViewInit(): void {
        this.currentData = this.data;
        const currentColumnFilter: FilterDescriptor =
            this.currentFilter.filters.find(
                (filter: FilterDescriptor) => filter.field === this.field
            );
        if (currentColumnFilter) {
            this.value = currentColumnFilter.value;
        }
    }
}
