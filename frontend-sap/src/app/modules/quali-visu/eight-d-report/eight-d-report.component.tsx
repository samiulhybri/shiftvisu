import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";

import moment from "moment";
import { lastValueFrom } from "rxjs";
import React from "react";
import { Button } from "@ui5/webcomponents-react";

import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { EightDReport } from "@app/shared/models/eight-d-report.model";
import { Plant } from "@app/shared/models/plant.model";
import { Suppliers } from "@app/shared/models/suppliers.model";
import { AuthService } from "@app/shared/services/auth.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { returnChanges } from "@app/shared/utils/return-changes";
import {
	EightDReportTabType,
	EightDReportTabTypeClass,
} from "@app/shared/enums/EightDReportTabType";
import { Chat } from "@app/shared/models/chat.model";
import { User } from "@app/shared/models/user.model";
import { ICustomButton } from "@app/shared/interfaces/custom-button.interface";

import { QualiVisuService } from "@app/modules/quali-visu/services/quali-visu.service";
import { EightDReportGeneralComponent } from "@app/modules/quali-visu/eight-d-report/eight-d-report-general/eight-d-report-general.component";
import { FiveWComponent } from "@app/modules/quali-visu/eight-d-report/five-w/five-w.component";
import { IshikawaComponent } from "@app/modules/quali-visu/eight-d-report/ishikawa/ishikawa.component";
import { EightDAttachmentComponent } from "@app/modules/quali-visu/eight-d-report/eight-d-attachment/eight-d-attachment.component";

@Component({
	selector: "app-eight-d-report",
	templateUrl: "./eight-d-report.component.html",
	styleUrl: "./eight-d-report.component.css",
})
export class EightDReportComponent {
	@ViewChild("generalComponent", { static: false })
	generalComponent?: EightDReportGeneralComponent;

	@ViewChild("fiveWComponent", { static: false })
	fiveWComponent?: FiveWComponent;

	@ViewChild("ishikawaComponent", { static: false })
	ishikawaComponent?: IshikawaComponent;

	@ViewChild("eightDAttachment", { static: false })
	eightDAttachment?: EightDAttachmentComponent;

	@ViewChild("eightDReportRef", { static: false }) eightDReportRefGrid:
		| CustomReactGridTable
		| undefined;

	public fileCount: number = 0;

	localization = Localization;

	baseUrl = "EightDReports";

	saveMode: "post" | "patch" | null = null;

	is8DReportPopupOpen: boolean = false;

	initialEightDReport = {};

	selectedTab = EightDReportTabType.GENERAL;

	eightDReportArray = EightDReportTabTypeClass.getEnumArray();
	deleteId: number | null = null;
	isDeletingReport: boolean = false;

	isChatOpen = false;
	isPreviewDialogOpen: boolean = false;
	public filePreviewHeight = 629;
	isDownloadingFile: boolean = false;

	get permissionEnum() {
		return PermissionEnum;
	}

	data: any[] = [];

	columns = [
		{
			Header: $localize`Title`,
			accessor: "title",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Supplier Name`,
			accessor: "supplier.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Opening Date`,
			accessor: "complaint_opening_date",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			dataType: GridTableColumnDataType.Date,
		},
		{
			Header: $localize`Revision`,
			accessor: "revision",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
		},
		{
			Header: $localize`Revision Date`,
			accessor: "revision_date",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.Date,
			hAlign: "Right",
		},
		/**
		 * ToDo: Add this field when the requirement for this is confirmed.
		 */
		{
			Header: $localize`Production Site`,
			accessor: "...",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Parts Name`,
			accessor: "part_name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Drawing No.`,
			accessor: "drawing_no",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
		},
		{
			Header: $localize`Drawing Revision`,
			accessor: "drawing_revision",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Q. Delivery`,
			accessor: "quantity_delivered",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
		},
		{
			Header: $localize`Q. Claimed`,
			accessor: "quantity_claimed",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
		},
		{
			Header: $localize`Plant`,
			accessor: "plant.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Team`,
			disableFilters: false,
			accessor: "team.name",
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Attachment`,
			accessor: "...",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			maxWidth: 120,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				let totalAttachments: any[] = [];

				rowData.media.map((item: any) => {
					if (item.collection_name == "default") {
						totalAttachments.push(item.id);
					}
				});
				if (totalAttachments.length > 0) {
					return (
						<React.StrictMode>
							<Button
								icon="attachment"
								onClick={() => this.showPreview(rowData, totalAttachments.length)}>
								{totalAttachments.length + $localize` Files`}
							</Button>
						</React.StrictMode>
					);
				} else return null;
			},
		},
	];

	customButtons: ICustomButton[] = [
		{
			id: "edit",
			icon: "edit",
			onClick: this.editClickFromCustomAction.bind(this),
		},
		{
			id: "print",
			icon: "print",
			onClick: this.printButtonClick.bind(this),
		},
		{
			id: "delete",
			icon: "delete",
			onClick: this.deleteClickFromCustomAction.bind(this),
		},
	];

	selectedEightDReport: EightDReport = {
		id: 0,
		title: "",
		supplier: new Suppliers().deserialize({}),
		supplier_id: 0,
		description: "",
		complaint_no: "",
		complaint_opening_date: "",
		revision: 0,
		revision_date: "",
		production_site: "",
		part_name: "",
		drawing_no: 0,
		drawing_revision: "",
		quantity_delivered: 0,
		quantity_claimed: 0,
		plant: new Plant().deserialize({}),
		plant_id: 0,
		team: [],
		author_accepted: false,
		author_closing_date: "",
		client_accepted: false,
		client_name: "",
		client_closing_date: "",
		chat_id: 1,
	};

	selectedEightDReportId: number | null = null;

	selectedRowIds: Record<int, boolean> = {};

	get eightDReportTabType() {
		return EightDReportTabType;
	}

	constructor(
		public qualiVisuService: QualiVisuService,
		public authService: AuthService,
		public _toasterSrv: ToastService,
		private cdr: ChangeDetectorRef
	) {}

	processData(allData: any[], recentData: any[]) {
		this.data = allData;
	}

	newButtonClick() {
		this.selectedTab = EightDReportTabType.GENERAL;
		this.selectedEightDReportId = null;

		this.saveMode = "post";
		this.is8DReportPopupOpen = true;

		this.selectedEightDReport = {
			id: 0,
			title: "",
			supplier: new Suppliers().deserialize({}),
			description: "",
			complaint_no: "",
			complaint_opening_date: "",
			revision: 0,
			revision_date: "",
			production_site: "",
			part_name: "",
			drawing_no: 0,
			drawing_revision: "",
			quantity_delivered: 0,
			quantity_claimed: 0,
			plant: new Plant().deserialize({}),
			team: [],
			author_accepted: false,
			author_closing_date: "",
			client_accepted: false,
			client_name: "",
			client_closing_date: "",
		};

		this.generalComponent?.generalForm?.reset({ ...this.selectedEightDReport });

		this.cdr.detectChanges();
	}

	closeDialog(dialogType: "8D" | "delete") {
		if (dialogType == "8D") {
			this.is8DReportPopupOpen = false;
			this.selectedTab = this.eightDReportTabType.GENERAL;
		} else if (dialogType == "delete") {
			this.deleteId = null;
		}
	}

	downloadButtonClick() {
		let reportIds: number[] = [];
		let rowIdArray = Object.entries(this.selectedRowIds as Record<int, boolean>);

		if (!rowIdArray.length) {
			this._toasterSrv.showToast($localize`Select at least one report`, "error");
			return;
		}

		rowIdArray.forEach(selectedRow => {
			let reportId = this.data[Number(selectedRow[0])].id;
			reportIds.push(reportId);
		});

		let payload = {
			reportIds: reportIds,
		};
		this.isDownloadingFile = true;
		this.qualiVisuService
			.postFile("quali-visu/eight-d-report/download", payload, false)
			.subscribe({
				next: async (response: any) => {
					let blob: any;
					if (reportIds.length > 1) {
						blob = new Blob([response], { type: "application/zip" });
					} else {
						blob = new Blob([response], { type: "application/pdf" });
					}

					const fileUrl = URL.createObjectURL(blob);
					let fileLink = document.createElement("a");
					fileLink.href = fileUrl;

					if (reportIds.length > 1) {
						fileLink.download = "Reports";
					} else {
						fileLink.download = "Report";
					}

					fileLink.click();

					this.isDownloadingFile = false;
					this.cdr.detectChanges();
				},
				error: e => {
					this.isDownloadingFile = false;
					this.cdr.detectChanges();
				},
			});
	}

	printButtonClick(data: any) {
		let reportIds: number[] = [Number(data.original.id)];

		let payload = {
			reportIds: reportIds,
		};
		this.isDownloadingFile = true;
		this.qualiVisuService
			.postFile("quali-visu/eight-d-report/download", payload, false)
			.subscribe({
				next: async (response: any) => {
					let blob: any;
					blob = new Blob([response], { type: "application/pdf" });

					const fileUrl = URL.createObjectURL(blob);
					const iframe = document.createElement("iframe");
					iframe.style.display = "none";
					iframe.src = fileUrl;
					document.body.appendChild(iframe);
					iframe.contentWindow?.print();

					this.isDownloadingFile = false;
					this.cdr.detectChanges();
				},
				error: e => {
					this.isDownloadingFile = false;
					this.cdr.detectChanges();
				},
			});
	}

	deleteClick(data: any) {
		this.deleteId = data.id;
	}

	editClickFromCustomAction(event: any) {
		this.editClick(event.original);
	}

	deleteClickFromCustomAction(event: any) {
		this.deleteClick(event.original);
	}

	editClick(event: any) {
		this.selectedTab = EightDReportTabType.GENERAL;

		this.saveMode = "patch";

		event = {
			...event,
			complaint_opening_date: event.complaint_opening_date
				? moment(event.complaint_opening_date).format("DD.MM.YYYY")
				: "",
			revision_date: event.revision_date
				? moment(event.revision_date).format("DD.MM.YYYY")
				: "",
			author_closing_date: event.author_closing_date
				? moment(event.author_closing_date).format("DD.MM.YYYY")
				: "",
			client_closing_date: event.client_closing_date
				? moment(event.client_closing_date).format("DD.MM.YYYY")
				: "",
		};

		this.initialEightDReport = { ...event };
		this.selectedEightDReport = { ...event };

		this.generalComponent?.generalForm?.reset({ ...event });
		this.selectedEightDReportId = event.id;
		this.is8DReportPopupOpen = true;
		this.cdr.detectChanges();
	}

	onRowClicked(event: any) {
		this.selectedRowIds = event.detail.selectedRowIds;
	}

	updateSelectedTabOnTabSelect(event: any) {
		this.selectedTab = event?.detail.tab.id;
	}

	async saveData(openNext = false) {
		/**
		 * ToDo: Remove undefined production_site when proper requirement is given
		 * */
		let url = this.baseUrl;

		let payload: any = {};
		if (this.saveMode == null) {
			return;
		}

		let team: User[] = [...(this.selectedEightDReport.team ?? [])];

		if (!this.selectedEightDReport.title || !team.length || team.some(m => !m.id)) {
			if (this.selectedTab != this.eightDReportTabType.GENERAL) {
				this.selectedTab = this.eightDReportTabType.GENERAL;
			}

			return;
		}

		let updatedEightDReport = { ...this.selectedEightDReport };

		if (
			!moment(this.selectedEightDReport.complaint_opening_date, "DD.MM.YYYY", true).isValid()
		) {
			updatedEightDReport.complaint_opening_date = null;
		}

		if (!moment(this.selectedEightDReport.revision_date, "DD.MM.YYYY", true).isValid()) {
			updatedEightDReport.revision_date = null;
		}

		if (!moment(this.selectedEightDReport.author_closing_date, "DD.MM.YYYY", true).isValid()) {
			updatedEightDReport.author_closing_date = null;
		}

		if (!moment(this.selectedEightDReport.client_closing_date, "DD.MM.YYYY", true).isValid()) {
			updatedEightDReport.client_closing_date = null;
		}

		let eightDSaveMode = this.saveMode;

		if (this.saveMode == "post") {
			let chat = new Chat().deserialize({});
			this.saveMode = null;
			let createdChat: any = await lastValueFrom(this.qualiVisuService.post("/Chats", chat));
			updatedEightDReport.author_id = this.authService.getUser().id;

			payload = {
				...updatedEightDReport,
				id: undefined,
				chat_id: createdChat.id,
				production_site: undefined,
				team: undefined,
				supplier: undefined,
				plant: undefined,
			};
		} else if (this.saveMode == "patch") {
			url += `/${this.selectedEightDReportId}`;
			payload = {
				...returnChanges(this.initialEightDReport, updatedEightDReport),
				team: undefined,
			};
		}

		if (Object.keys(payload).length === 0) {
			if (openNext) {
				this.selectNextTab();
			} else {
				this.closeDialog("8D");
			}
			return;
		}

		this.saveMode = null;
		try {
			if (payload) {
				let r: any = await lastValueFrom(
					this.qualiVisuService[eightDSaveMode](
						url + "?expand=author,chat,plant,supplier",
						payload
					)
				);

				let resultEightDReport = {
					...r,
					complaint_opening_date: r.complaint_opening_date
						? moment(r.complaint_opening_date).format("DD.MM.YYYY")
						: "",
					revision_date: r.revision_date
						? moment(r.revision_date).format("DD.MM.YYYY")
						: "",
					author_closing_date: r.author_closing_date
						? moment(r.author_closing_date).format("DD.MM.YYYY")
						: "",
					client_closing_date: r.client_closing_date
						? moment(r.client_closing_date).format("DD.MM.YYYY")
						: "",
					team: this.selectedEightDReport.team,
				};
				this.selectedEightDReportId = resultEightDReport.id;
				this.initialEightDReport = { ...resultEightDReport };
				this.selectedEightDReport = { ...resultEightDReport };
			}

			(await lastValueFrom(
				this.qualiVisuService.post(
					`quali-visu/${this.selectedEightDReportId}/team-members`,
					{ userIds: team.map(m => m.id) },
					false
				)
			)) as any;

			if (this.selectedTab == EightDReportTabType.FIVE_W) {
				await this.fiveWComponent?.saveData();
			}

			if (this.selectedTab == EightDReportTabType.ISHIKAWA) {
				await this.ishikawaComponent?.saveData();
			}

			if (this.selectedTab == EightDReportTabType.ATTACHMENT && this.selectedEightDReportId) {
				await this.eightDAttachment?.saveItemAttachments();

				if (openNext) this.eightDAttachment?.eightDAttachment?.ngOnInit();
			}

			if (openNext) {
				this.saveMode = "patch";
				this.selectNextTab();
			} else {
				this.closeDialog("8D");
			}
			this.eightDReportRefGrid?.onFilterAndSorting();

			this.initialEightDReport = { ...this.selectedEightDReport };
		} catch {
			this.is8DReportPopupOpen = false;
			this._toasterSrv.showToast(this.localization.failedToSaveData, "error");
		}
	}

	refreshGrid() {
		this.eightDReportRefGrid?.onFilterAndSorting();
	}

	selectNextTab() {
		let currentTabIndex = this.eightDReportArray.findIndex(t => t == this.selectedTab);
		let newTabIndex =
			currentTabIndex + 1 < this.eightDReportArray.length ? currentTabIndex + 1 : 0;
		this.selectedTab = this.eightDReportArray[newTabIndex];

		this.generalComponent?.broadCastUpdatedTeamMembers();
	}

	deleteReport() {
		this.isDeletingReport = true;
		let url = this.baseUrl + `/${this.deleteId}`;
		this.qualiVisuService.delete(url).subscribe({
			next: r => {
				this.deleteId = null;
				this.isDeletingReport = false;
				this.eightDReportRefGrid?.onFilterAndSorting();
			},
			error: error => {
				this.deleteId = null;
				this.isDeletingReport = false;
				this.eightDReportRefGrid?.onFilterAndSorting();
			},
		});
	}

	openChat() {
		this.isChatOpen = true;
	}

	closeChat() {
		this.isChatOpen = false;
	}

	checkIfSaveable() {
		return (
			this.selectedEightDReport.title &&
			this.selectedEightDReport.team?.length &&
			this.selectedEightDReport?.team.every(m => m.id)
		);
	}

	showPreview(rowData: any, totalFiles: number) {
		this.fileCount = totalFiles;
		this.selectedEightDReportId = rowData.id;
		this.isPreviewDialogOpen = true;
	}

	closeAttachmentDialog() {
		this.isPreviewDialogOpen = false;
		this.selectedEightDReportId = 0;
	}
}
