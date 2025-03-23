import { Component, ViewChild, ElementRef, SimpleChanges, Input, Output, EventEmitter } from "@angular/core";
import {
	AnalyticalTable,
	ThemeProvider,
	DateRangePicker,
	BusyIndicator,
} from "@ui5/webcomponents-react";
import { Toolbar, ToolbarSpacer } from "@ui5/webcomponents-react-compat";
import React from "react";
import { createRoot, Root } from "react-dom/client";

@Component({
	selector: "app-machine-state-history-table",
	templateUrl: "./machine-state-history-table.component.html",
	styleUrl: "./machine-state-history-table.component.css",
})
export class MachineStateHistoryTableComponent {
	private root: Root | null = null;
	@ViewChild("HistoryTable", { static: true }) historyTable?: ElementRef;
	@Input() columns = [];
	@Input() data: any[] = [];
	@Input() headerTitle?: string = "";
	@Input() dateValue?: string = "";
	@Input() loading: boolean = false;
	@Output() public changeRangeDatePicker = new EventEmitter<any>();
	constructor() {
		this.onChangeRangeDatePicker = this.onChangeRangeDatePicker.bind(this);
	}
	
	ngOnChanges(changes: SimpleChanges): void {
		if (!this.root) {
			this.root = createRoot((this.historyTable! as any).nativeElement!);
		}
		this.render();
	}

	ngOnDestroy() {
		this.root?.unmount();
	}

	public onChangeRangeDatePicker = (value: object) => {
		if (this.changeRangeDatePicker) {
			this.changeRangeDatePicker.emit(value);
			this.render();
		}
	};

	render() {
		let {
			onChangeRangeDatePicker
		} = this;

		this.root?.render(
			<React.StrictMode>
				<ThemeProvider>
						<Toolbar
							style={{
								backgroundColor: "white",
								borderTopRightRadius: "10px",
								borderTopLeftRadius: "10px",
								height: "45px",
							}}>
							{this.loading ? (
								<BusyIndicator active={this.loading} delay={1000} size="S" style={{ marginLeft: "16px" }} />
							) : (
								<></>
							)}
							<h3 style={{ marginLeft: "16px" }}>{this.headerTitle}</h3>
							<ToolbarSpacer />
							<DateRangePicker
								id="datePicker"
								className="grid-table-date-picker-width"
								onChange={(e)=> onChangeRangeDatePicker(e)}
								formatPattern="MMM d, YYYY"
								value={this.dateValue}
								valueState="None"
								style={{ marginRight: "23px", width: "247px" }}
							/>
						</Toolbar>
						<div style={{ height: "calc(68vh - 145px)" }}>
							<AnalyticalTable
								style={{
									backgroundColor: "white",
									borderRadius: "10px",
									borderBottom: "0px",
								}}
								columns={this.columns}
								data={this.data}
								loading={this.loading}
								infiniteScroll={true}
								visibleRowCountMode="AutoWithEmptyRows"
								visibleRows={8}
								selectionMode={"None"}
							/>
						</div>
				</ThemeProvider>
			</React.StrictMode>
		);
	}
}
