import { Component, ViewChild,ElementRef, SimpleChanges, Input } from '@angular/core';
import { AnalyticalTable, ThemeProvider } from '@ui5/webcomponents-react';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

@Component({
  selector: 'app-clockin-table',
  templateUrl: './clockin-table.component.html',
  styleUrl: './clockin-table.component.css'
})
export class ClockinTableComponent {
  private root: Root | null = null;
	@ViewChild("LoginTable", { static: true }) loginTable?: ElementRef;
	@Input() columns = [];
	@Input() data: any[] = [];

	ngOnChanges(changes: SimpleChanges): void {
		if (!this.root) {
			this.root = createRoot(this.loginTable!.nativeElement!);
		}
		this.render();
	}

	ngOnDestroy() {
		this.root?.unmount();
	}

	render() {
		this.root?.render(
			<React.StrictMode>
				<ThemeProvider>
					<AnalyticalTable
						style={{
							backgroundColor: "white",
							height: "100%",
							borderRadius: "10px",
							borderBottom: "0px",
						}}
						columns={this.columns}
						data={this.data}
						infiniteScroll
						visibleRowCountMode="Auto"
						visibleRows={8}
						minRows={8}
						selectionMode={"Single"}
					/>
				</ThemeProvider>
			</React.StrictMode>
		);
	}
}
