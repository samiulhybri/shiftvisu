import {
	Component,
	ViewChild,
	ElementRef,
	SimpleChanges,
	Input,
	Output,
	EventEmitter,
} from "@angular/core";
import {
	AnalyticalTable,
	ThemeProvider,
	Input as ReactInput,
	Icon,
	Button,
} from "@ui5/webcomponents-react";
import { Toolbar, ToolbarSpacer } from "@ui5/webcomponents-react-compat";
import React from "react";
import { createRoot, Root } from "react-dom/client";

@Component({
	selector: "app-associate-table",
	templateUrl: "./associate-table.component.html"
})
export class AssociateTableComponent {
	private root: Root | null = null;
	@ViewChild("AssociateTable", { static: true }) historyTable?: ElementRef;
	@Input() loading: boolean = false;
	@Input() columns = [];
	@Input() data: any[] = [];
	@Input() headerTitle?: string = "";
	@Input() buttonText?: string = "";
	@Output() public buttonClick = new EventEmitter<any>();
	@Output() public searchInput = new EventEmitter<any>();

	constructor() {
		this.handleButtonClick = this.handleButtonClick.bind(this);
		this.searchFromInput = this.searchFromInput.bind(this);
	}
	ngOnChanges(changes: SimpleChanges): void {
		if (!this.root) {
			this.root = createRoot(this.historyTable!.nativeElement!);
		}
		this.render();
	}

	ngOnDestroy() {
		this.root?.unmount();
	}

	searchFromInput(value: string) {
		if (this.searchInput) {
			this.searchInput.emit(value);
			this.render();
		}
	}

	handleButtonClick() {
		if (this.buttonClick) {
			this.buttonClick.emit();
			this.render();
		}
	}

	render() {
		let { handleButtonClick, searchFromInput } = this;

		this.root?.render(
			<React.StrictMode>
				<ThemeProvider>
					<div style={{ maxWidth: "100%", height: "100%", overflowY: "auto" }}>
						<Toolbar
							style={{
								backgroundColor: "white",
								borderTopRightRadius: "10px",
								borderTopLeftRadius: "10px",
								height: "45px",
							}}>
							<h3>{`${this.headerTitle} (${this.data.length})`}</h3>
							<ToolbarSpacer />
							<ReactInput
								icon={<Icon name="search" />}
								showClearIcon={false}
								placeholder="Search"
								onKeyUp={(event) => searchFromInput((event.target as any).value)}
							/>
							<Button
								onClick={() => handleButtonClick()}
								id="associateButton"
								design="Emphasized">{this.buttonText}</Button>
						</Toolbar>
						<div style={{ height: "calc(100% - 45px)", overflowY: "auto" }}>
							<AnalyticalTable
								style={{
									backgroundColor: "white",
									height: "100%",
									borderRadius: "10px",
									borderBottom: "0px",
								}}
								columns={this.columns}
								data={this.data}
								loading={this.loading}
								infiniteScroll
								visibleRowCountMode="Auto"
								visibleRows={8}
								selectionMode={"None"}
							/>
						</div>
					</div>
				</ThemeProvider>
			</React.StrictMode>
		);
	}
}