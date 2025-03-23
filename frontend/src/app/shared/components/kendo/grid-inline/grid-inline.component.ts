
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AddEvent, CancelEvent, DataStateChangeEvent, EditEvent, GridComponent, GridDataResult, RemoveEvent, SaveEvent } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';

@Component({
	selector: 'kendo-grid-inline',
	templateUrl: './grid-inline.component.html',
	encapsulation: ViewEncapsulation.None,
	styleUrls: ['./grid-inline.component.scss']
})
export class GridInlineComponent implements OnInit {
	public formGroup!: FormGroup;
	private editedRowIndex!: number;

	// TODO: will be used later
	@Input() gridItems: any;
	@Input() isPageable: boolean = false;
	@Input() isSortable: boolean = false;
	@Input() isFilterable: boolean = false;
	@Input() isGroupable: boolean = false;
	@Input() filterTerm: number = 10;
	@Input() columns: any;
	@Input() state!: State;
	@Input() isLoadedEnabled: boolean = false;
	@Input() skip: number = 0;
	@Input() take = 10;
	@Input() colums: any;
	@Input() editView: any;
	@Input() editViewWidth!: string | number;

	@Output() emitData = new EventEmitter<{ skip: number, take: number }>();
	@Output() emitState = new EventEmitter<State>();

	constructor() { }

	public ngOnInit(): void { }

	/**
	 * Catch state change and  emit state to parent component (changeState function)
	 * @param state 
	 */
	public dataStateChange(state: DataStateChangeEvent): void {
		this.emitState.emit(state)
	}

	public addHandler(args: AddEvent): void {
		this.closeEditor(args.sender);

		// TODO: will add later
	}

	public editHandler(args: EditEvent): void {
		// define all editable fields validators and default values
		const { dataItem } = args;
		this.closeEditor(args.sender);

		const existingColumns = {}

		for (let i in this.columns) {
			Object.defineProperty(existingColumns, this.columns[i].name, {
				value: new FormControl(dataItem[this.columns[i].name])
			});
		}

		this.formGroup = new FormGroup(existingColumns);
		this.editedRowIndex = args.rowIndex;
		// put the row in edit mode, with the `FormGroup` build above
		args.sender.editRow(args.rowIndex, this.formGroup);
	}

	public cancelHandler(args: CancelEvent): void {
		// close the editor for the given row
		this.closeEditor(args.sender, args.rowIndex);
	}

	public saveHandler({ sender, rowIndex, formGroup, isNew }: SaveEvent): void {
		const product: [] = formGroup.value;
		sender.closeRow(rowIndex);
	}

	public removeHandler(args: RemoveEvent): void {
		// remove the current dataItem from the current data source,
	}

	private closeEditor(grid: GridComponent, rowIndex = this.editedRowIndex) {
		// close the editor
		grid.closeRow(rowIndex);
	}
}