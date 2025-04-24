import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ShiftVisuOverview } from "@app/shared/models/shift-visu-overview.model";
import { Button, CheckBox, Switch } from "@ui5/webcomponents-react";
import React from "react";
@Component({
	selector: "app-server-issues-view",
	templateUrl: "./server-issues-view.component.html",
	styleUrl: "./server-issues-view.component.css",
})
export class ServerIssuesViewComponent implements OnInit {
	@Input() isOpenView: EventEmitter<object> = new EventEmitter<object>();
	@ViewChild("overview", { static: false }) overview!: any;
	@ViewChild("emergency", { static: false }) emergency!: any;
	@ViewChild("corrective", { static: false }) corrective!: any;
	@ViewChild("details", { static: false }) details!: any;
	@ViewChild("attachment", { static: false }) attachment!: any;
	@ViewChild("chat", { static: false }) chat!: any;
	@ViewChild("chatcontent", { static: false }) chatcontent!: any;
	OpenView: boolean = false;
	tabRefs: Record<string, any> = {};
	Overview: ShiftVisuOverview = new ShiftVisuOverview().deserialize({});
	isOpenChat: boolean = false;
	
	ngOnInit(): void {
		this.isOpenView.subscribe((items: any) => {
			this.Overview.deserialize(items.data);
			this.OpenView = !this.OpenView;
			this.openTab(items.tab);
		});
	}
	imgname: string = "shihab.jpg";

	ngAfterViewInit() {
		this.tabRefs = {
			overview: this.overview,
			emergency: this.emergency,
			corrective: this.corrective,
			details: this.details,
			attachment: this.attachment,
			chat: this.chat,
		};
	}

	openTab(tabType: string) {
		this.selectTab(tabType);
	}

	selectTab(tabType: string) {
		for (const key in this.tabRefs) {
			const tabElement = this.tabRefs[key]?.elementRef.nativeElement;
			if (tabElement) {
				tabElement.selected = key === tabType;
			}
		}
	}

	imageType(name: string) {
		const imgtype = ["jpg", "jpeg", "png", "gif", "bmp", "tiff"];
		const docType = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"];
		const extension = name.split(".").pop();
		if (imgtype.includes(extension ?? "")) {
			return "image";
		}
		if (docType.includes(extension ?? "")) {
			return "document";
		}

		return name;
	}

	imageExtension(name: string) {
		const extension = name.split(".").pop();
		if (extension) {
			return extension;
		}
		return "";
	}

	columns = [
		{
			Header: $localize`Details`,
			accessor: "details",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Responsible`,
			accessor: "responsible",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Restart`,
			accessor: "restart",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "End",
		},
		{
			Header: $localize`End Date`,
			accessor: "enddate",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "End",
		},
		{
			Header: $localize`No Corrective Measure`,
			accessor: "nocorrective",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			Cell: (instance: any) => {
				return (
					<React.StrictMode>
						<CheckBox checked readonly />
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Finished`,
			accessor: "finished",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			Cell: (instance: any) => {
				return (
					<React.StrictMode>
						<Switch checked={true} disabled={true} onChange={function Xs() {}} />
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Action`,
			accessor: "action",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			Cell: (instance: any) => {
				return (
					<React.StrictMode>
						<Button icon="edit" design="Transparent" disabled={true}></Button>
						<Button icon="delete" design="Transparent" disabled={true}></Button>
					</React.StrictMode>
				);
			},
		},
	];

	customdata: any = [
		{
			details: "new issue created and viewed with chart",
			creator: "shihab",
			nocorrective: "true",
			responsible: "new error",
			restart: "23.25.2025",
			enddate: "23.4.2322",
			finished: true,
		},
	];

	CloseDialog() {
		this.OpenView = false;

	}
}
