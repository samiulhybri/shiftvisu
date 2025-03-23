import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AnalyticalTable, Input as UI5Input, Icon, ThemeProvider } from '@ui5/webcomponents-react';
import { Toolbar } from '@ui5/webcomponents-react-compat';
import * as React from "react";
import { useCallback, useState } from 'react';
import { Root, createRoot } from "react-dom/client";
import { AnalyticalTableHooks } from '@ui5/webcomponents-react';

@Component({
	selector: 'app-repair-tree',
	templateUrl: './repair-tree.component.html',
	styleUrl: './repair-tree.component.css'
})
export class RepairTreeComponent {
	@Input() selectionMode = "Multiple";
	@Input() tableTitle?: string = "";
	@Input() minRows = 15;
	@Input() columns: any = []
	@Input() data: any = []
	@Input() selectedRowIds: { [key: number]: boolean } = {};
	@Input() subRowsKey!: string;
	@Input() showTableSearch: boolean = true;
	@Input() public set dataChangeTrigger(dataItem: any) {
		if (dataItem) {
			this.data = dataItem;
			this.render()
		}
	}
	@Output() finalSelectedRepairs: EventEmitter<any> = new EventEmitter();
	@Output() searchWord: EventEmitter<any> = new EventEmitter();
	@ViewChild("CustomTreeTableLayout", { static: true }) containerRef!: ElementRef;

	private root: Root | null = null;
	private selectedRepairs: any[] = [];
	public searching: string = '';

	ngOnInit() {
		if (!this.root) this.root = createRoot(this.containerRef.nativeElement!);
		this.render();
	}

	render() {
		const TableComponent = () => {
			const [selectedRowIds, setSelectedRowIds] = useState<{ [key: number]: boolean }>({});
			const handleRowSelect = useCallback((rowId: any | null, isSelected: boolean, allRowsSelected: boolean, rowData: any) => {
				if (rowId == null && allRowsSelected) {
					const newSelectedIds: { [key: number]: boolean } = { ...selectedRowIds };
					rowData.forEach((plan: any) => {
						newSelectedIds[plan.id] = true;
						this.selectedRowIds[plan.original.id] = true;
						if (plan.original.operationPlanPos) {
							plan.original.operationPlanPos.forEach((pos: any) => {
								this.selectedRepairs.push(pos)
								this.selectedRowIds[pos.id] = true;
							});
						}
					});

					setSelectedRowIds(newSelectedIds);
				} else if (rowId == null && !allRowsSelected) {
					setSelectedRowIds({});
					this.selectedRowIds = {};
					this.selectedRepairs = [];
				} else {
					const newSelectedIds: { [key: number]: boolean } = { ...selectedRowIds };
					newSelectedIds[rowId] = isSelected;
					const tempSelectedRepairs: { [key: number]: boolean } = { ...this.selectedRowIds };

					if (rowId.includes(".")) {
						const parts = rowId.split('.');
						let parentIndex = parseInt(parts[0]);
						let childIndex = parseInt(parts[1]);
						let parentData = this.data[parentIndex];
						let childData = parentData.operationPlanPos[childIndex];

						if (isSelected) {
							newSelectedIds[rowId] = isSelected;
							tempSelectedRepairs[childData.id] = isSelected;
							this.selectedRowIds[childData.id] = isSelected;

							let isAllChildSelected: number = 0;
							parentData.operationPlanPos.forEach((elm: any) => {
								if (elm.id in tempSelectedRepairs) isAllChildSelected++;
							})
							if (isAllChildSelected == parentData.operationPlanPos.length) newSelectedIds[parentIndex] = isSelected;
						} else {
							delete newSelectedIds[rowId];
							delete tempSelectedRepairs[childData.id];
							delete this.selectedRowIds[childData.id];

							if (parentIndex in newSelectedIds) delete newSelectedIds[parentIndex];
						}
					} else {
						let parentData = this.data.find((row: any) => row.id === rowData.original.id);
						const childRow = rowData.subRows && rowData.subRows.length > 0 ? rowData.subRows : [];

						if (isSelected) {
							childRow.forEach((subRow: any) => {
								newSelectedIds[subRow.id] = isSelected;
							});
							parentData.operationPlanPos.forEach((subRow: any) => {
								tempSelectedRepairs[subRow.id] = isSelected;
								this.selectedRowIds[subRow.id] = isSelected;
							})
						} else {
							delete newSelectedIds[rowId];
							parentData.operationPlanPos.forEach((subRow: any) => {
								delete tempSelectedRepairs[subRow.id];
								delete this.selectedRowIds[subRow.id];
							});
							childRow.forEach((subRow: any) => {
								delete newSelectedIds[subRow.id];
							});
						}
					}

					setSelectedRowIds(newSelectedIds);
					this.selectedRepairs = this.data
						.flatMap((plan: any) => plan.operationPlanPos || [])
						.filter((pos: any) => tempSelectedRepairs[pos.id]);
				}
				this.finalSelectedRepairs.emit(this.selectedRepairs);

			}, [selectedRowIds, this.data]);

			React.useEffect(() => {
				const initialSelectedIds: { [key: string]: boolean } = {};

				for (let i = 0; i < this.data.length; i++) {
					let plan = this.data[i];
					if (plan.operationPlanPos && plan.operationPlanPos.length > 0) {
						let count = 0;
						for (let j = 0; j < plan.operationPlanPos.length; j++) {
							if (this.selectedRowIds[plan.operationPlanPos[j].id] == true) {
								let index = `${i}.${j}`;
								initialSelectedIds[index] = true;
								count++;
							}
						}
						if (count == plan.operationPlanPos.length) initialSelectedIds[i] = true;
					}
				}
				setSelectedRowIds(initialSelectedIds);
			}, [this.data]);

			return (
				<ThemeProvider>
					<Toolbar
						design="Auto"
						onOverflowChange={function _a() { }}
						toolbarStyle="Standard"
						style={{
							backgroundColor: "white",
							border: "var(--card-border-color)",
							borderTopRightRadius: "10px",
							borderTopLeftRadius: "10px",
							height: "50px",
							display: "flex",
							alignItems: "center",
							width: "100%",
							boxSizing: "border-box"
						}}>

						<h3 style={{ width: "10vw", margin: "0 1%", fontSize: "clamp(14px, 2vw, 16px)" }}>
							{this.tableTitle}
						</h3>
						{this.showTableSearch ? <div style={{ width: "clamp(20vw, 25vw, 30vw)" }}></div>: null}
					
							{this.showTableSearch ? (
								<UI5Input

								icon={<Icon name="search" />}
								placeholder={$localize`Search...`}
								style={{
									border: "var(--card-border-color)",
									borderRadius: "5px",
									height: "30px",
									width: "10vw"
								}}
								onInput={(e: any) => {
									const search = e.target.value;
									if (search == '') this.searchWord.emit(search);
								}}
								onChange={(e: any) => {
									this.searching = e.target.value;
									this.searchWord.emit(this.searching);
								}}
								type="Text"
								value={this.searching}
								valueState="None"
								showClearIcon
							/>
							) : null}
					</Toolbar>
					<div style={{ height: 'calc(100% - 50px)' }}>
						<AnalyticalTable
							style={{
								border: "var(--card-border-color)",
								borderBottomLeftRadius: '10px',
								borderBottomRightRadius: '10px',
							}}
							isTreeTable={true}
							subRowsKey={this.subRowsKey}
							subComponentsBehavior={'Visible'}
							columns={this.columns}
							data={this.data}
							// filterable
							withRowHighlight={false}
							groupBy={[]}
							groupable
							infiniteScroll
							minRows={this.minRows}
							visibleRowCountMode={'AutoWithEmptyRows'}
							onAutoResize={function _a() { }}
							onColumnsReorder={function _a() { }}
							onGroup={function _a() { }}
							onLoadMore={function _a() { }}
							onClick={function _a() { }}
							onRowExpandChange={(e: any) => { }}
							onSort={function _a() { }}
							onTableScroll={function _a() { }}
							selectedRowIds={selectedRowIds}
							selectionMode={this.selectionMode as any}
							onRowSelect={(e: any) => {
								const isSelected = e.detail.isSelected ?? false;
								const allRowsSelected = e.detail.allRowsSelected;
								const id = !allRowsSelected ? e.detail?.row?.id : null;
								const data = allRowsSelected ? e.detail.selectedFlatRows : e.detail.row;
								handleRowSelect(id, isSelected, allRowsSelected, data);
								// this.render();
							}}
							tableHooks={[AnalyticalTableHooks.useIndeterminateRowSelection()]}
							withNavigationHighlight
						/>
					</div>

				</ThemeProvider>
			);
		};

		this.root?.render(
			<React.StrictMode>
				<TableComponent />
			</React.StrictMode>
		);
	}
}