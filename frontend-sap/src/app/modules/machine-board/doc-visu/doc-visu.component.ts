import { Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { of, Subject, takeUntil } from "rxjs";

import { ToastService } from "@app/shared/services/toaster.service";

import { DocVisuService } from "@doc-visu/doc-visu.service";
import { Section } from "@app/shared/interfaces/section";
import { IDirectory } from "@app/shared/interfaces/directory.interface.";
import { any } from "@amcharts/amcharts5/.internal/core/util/Array";

@Component({
	selector: "app-doc-visu",
	templateUrl: "./doc-visu.component.html",
	styleUrls: ["./doc-visu.component.css"],
})
export class DocVisuComponent implements OnDestroy {
	docVisuPage: string = $localize`DocVisu`;
	isSideNavCollapsed = true;
	isDialogOpen = true;
	machineId: number = 0;
	itemId: number = 0;
	machineName: string = ``;
	public directory?: IDirectory;
	public isNavBarLoading: boolean = false;
	public isLoading: boolean = true;
	public isProcessLoading: boolean = false;
	public operations: any[] = [];
	public orders: any[] = [];
	public items: any[] = [];
	public tools: any[] = [];
	private sections: Section[] = [];
	public processId: number = 0;
	public isMachineBoardActive: boolean = true;
	@ViewChild("machineNavItem", { static: false }) machineNavItem!: ElementRef;
	private destroy$ = new Subject<void>();

	constructor(
		private activeRoute: ActivatedRoute,
		private router: Router,
		private _toasterSrv: ToastService,
		private docVisuService: DocVisuService
	) {}

	ngOnInit(): void {
		this.isNavBarLoading = true;
		this.isLoading = true;
		this.activeRoute.parent?.params.subscribe(params => {
			this.machineId = params["id"];
			if (this.machineId) {
				this.selectMachine(this.machineId);
			}
		});

		const query = `Machines(${this.machineId})?$expand=prodOrderPosOperations($expand=tool,itemTool,prodOrderPos($expand=item,prodOrder))`;
		this.docVisuService
			.get(query)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (res: any) => {
					this.isLoading = false;
					this.machineName = res.name;
					const operations = res.prodOrderPosOperations;

					for (const operation of operations) {
						const index = this.operations.findIndex(
							(item: any) => item.id === operation.id
						);
						if (index === -1) {
							this.operations.push({
								id: operation.id,
								name: operation.name !== "" ? operation.name : operation.pos,
							});
						}

						const { prodOrderPos, tool, itemTool } = operation;

						if (tool) {
							const index = this.tools.findIndex((item: any) => item.id === tool.id);
							if (index === -1) {
								this.tools.push({
									id: tool.id,
									name:
										tool.name !== ""
											? `${tool.name} - ${tool.custom_id}`
											: tool.custom_id,
								});
							}
						}

						if (itemTool) {
							const index = this.items.findIndex(
								(item: any) => item.id === itemTool.id
							);
							if (index === -1) {
								this.items.push({
									id: itemTool.id,
									name:
										itemTool.name !== ""
											? `${itemTool.name} - ${itemTool.custom_id}`
											: itemTool.custom_id,
								});
							}
						}

						if (prodOrderPos) {
							const { item, prodOrder } = prodOrderPos;

							if (item) {
								const index = this.items.findIndex((it: any) => it.id === item.id);
								if (index === -1) {
									this.items.push({
										id: item.id,
										name:
											item.name !== ""
												? `${item.name} - ${item.custom_id}`
												: item.custom_id,
									});
								}
							}

							if (prodOrder) {
								const index = this.orders.findIndex(
									(it: any) => it.id === prodOrder.id
								);
								if (index === -1) {
									this.orders.push({
										id: prodOrder.id,
										name: prodOrder.custom_id,
									});
								}
							}
						}
					}
					this.isNavBarLoading = false;
				},
				error: e => {
					this.isLoading = false;
					this.isNavBarLoading = false;
					this._toasterSrv.showToast(`Something went wrong`, "error-toaster");
				},
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	onClickSidebarChange(expandOnly: boolean = false) {
		if (expandOnly) {
			this.isSideNavCollapsed = false;
		} else {
			this.isSideNavCollapsed = !this.isSideNavCollapsed;
		}
	}

	selectMachine(id: number) {
		if (!id) return;
		this.isProcessLoading = true;

		const request$ = this.getStructureByQuery$(id, "App\\Models\\Machine");

		request$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (directoryStructures: any) => {
				if (directoryStructures.length > 0) {
					const directoryStructure = directoryStructures[0];
					this.processId = directoryStructure.id;
					this.machineId = id;
				} else {
					this.docVisuService
						.assignDirectoryStructure(
							this.machineName,
							"App\\Models\\Machine",
							id,
							this.directory
						)
						.pipe(takeUntil(this.destroy$))
						.subscribe({
							next: (data: any) => {
								this.processId = data.id;
								this.machineId = id;
							},
							error: e => {
								this._toasterSrv.showToast(`Something went wrong`, "error-toaster");
							},
							complete: () => {
								this.isProcessLoading = false;
							},
						});
				}
				this.isProcessLoading = false;
			},
			error: e => {
				this.isProcessLoading = false;
				this._toasterSrv.showToast(`Something went wrong`, "error-toaster");
			},
		});
	}

	selectOperation(operation: any) {
		throw new Error("Method not implemented.");
	}

	selectOrder(order: any) {
		throw new Error("Method not implemented.");
	}

	selectTool(tools: any) {
		throw new Error("Method not implemented.");
	}

	trackItemById(index: number, item: any): number {
		return item.id;
	}

	selectItem(id: number) {
		if (!id) return;
		this.isProcessLoading = true;

		const request$ = this.getStructureByQuery$(id, "App\\Models\\Item");

		request$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (directoryStructures: any) => {
				if (directoryStructures.length > 0) {
					const directoryStructure = directoryStructures[0];
					this.processId = directoryStructure.id;
					this.itemId = id;
				} else {
					this._toasterSrv.showToast(
						`This item doesn't have any structure`,
						"error-toaster"
					);
				}
				this.isProcessLoading = false;
			},
			error: e => {
				this.isProcessLoading = false;
				this._toasterSrv.showToast(`This item doesn't have any structure`, "error-toaster");
			},
		});
	}

	getStructureByQuery$(modelId: any, modelType: string) {
		let id = modelId;
		let model = modelType;

		if (model && id) {
			return this.docVisuService.getStructureByFilter(
				`sectionable_type=${model}&sectionable_id=${id}`
			);
		}
		return of({});
	}

	closeDialogDocVisuProcessDetailsPage() {
		this.isDialogOpen = false;
		this.router.navigate(["../"], { relativeTo: this.activeRoute });
	}
}
