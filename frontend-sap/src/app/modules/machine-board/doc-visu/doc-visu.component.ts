import { Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { of, Subject, takeUntil } from "rxjs";

import { ToastService } from "@app/shared/services/toaster.service";

import { DocVisuService } from "@doc-visu/doc-visu.service";
import { Localization } from "@app/shared/utils/common-localize";
import { IDirectory } from "@app/shared/interfaces/directory.interface.";
import { BackendModelType } from "@app/shared/enums/BackendModelType";

@Component({
	selector: "app-doc-visu",
	templateUrl: "./doc-visu.component.html",
	styleUrls: ["./doc-visu.component.css"],
})
export class DocVisuComponent implements OnDestroy {
	@ViewChild("machineNavItem", { static: false }) machineNavItem!: ElementRef;

	docVisuPage: string = $localize`DocVisu`;
	isSideNavCollapsed = true;
	isDialogOpen = true;
	machineId: number = 0;
	itemId: number = 0;
	toolId: number = 0;
	localization = Localization;
	machineName: string = ``;
	public directory?: IDirectory;
	public isNavBarLoading: boolean = false;
	public isLoading: boolean = true;
	public isProcessLoading: boolean = false;
	public operations: any[] = [];
	public orders: any[] = [];
	public items: any[] = [];
	public tools: any[] = [];
	public processId: number = 0;
	public isMachineBoardActive: boolean = true;
	private destroy$ = new Subject<void>();
	docSection?: any;
	private docSectionStructure: any = null;
	toolName: string = "";
	itemName: string = "";

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
		});

		const query = `Machines(${this.machineId})?$expand=prodOrderPosOperations($filter=status eq 'IN_PRODUCTION' or status eq 'IN_SETUP' or status eq 'IN_TEARDOWN';$expand=tool,itemTool,prodOrderPos($expand=item,prodOrder))`;
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
								if (item.is_tool === true) {
									// Add only to tools section
									const toolIndex = this.tools.findIndex(
										(it: any) => it.id === item.id
									);
									if (toolIndex === -1) {
										this.tools.push({
											id: item.id,
											name:
												item.name !== ""
													? `${item.name} - ${item.custom_id}`
													: item.custom_id,
										});
									}
								} else {
									// Add only to items section if it is NOT a tool
									const index = this.items.findIndex(
										(it: any) => it.id === item.id
									);
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
					this._toasterSrv.showToast(
						this.localization.someThingWentWrong,
						"error-toaster"
					);
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
		this.machineId = id;
		const request$ = this.getStructureByQuery$(id, BackendModelType.MACHINE);
		request$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (directoryStructures: any) => {
				if (directoryStructures.length > 0) {
					const directoryStructure = directoryStructures[0];
					this.processId = directoryStructure.id;
				} else {
					this.docVisuService
						.get(`DocumentSections?$filter=model_type eq 'App\\Models\\Machine'`)
						.subscribe({
							next: (response: any) => {
								if (
									response?.value &&
									Array.isArray(response.value) &&
									response.value.length > 0
								) {
									const docSection = response.value[0];
									if (docSection.directory_structure_id) {
										this.docVisuService
											.getStructureByFilter(
												`id=${docSection.directory_structure_id}`
											)
											.subscribe({
												next: (data: any) => {
													if (data && data.length > 0) {
														this.docSectionStructure = data[0];
														this.getStructureWithDirectories(
															this.docSectionStructure.id,
															this.machineName,
															BackendModelType.MACHINE
														);
													} else {
														this.assignDirectoryStructure(
															this.machineName,
															BackendModelType.MACHINE,
															id
														);
													}
												},
												error: e => {
													this._toasterSrv.showToast(
														Localization.someThingWentWrong,
														"error-toaster"
													);
												},
											});
									} else {
										this._toasterSrv.showToast(
											$localize`No directory structure ID found in DocumentSection`,
											"error-toaster"
										);
									}
								} else {
									this._toasterSrv.showToast(
										$localize`No matching DocumentSection found for Machine`,
										"error-toaster"
									);
								}
							},
							error: e => {
								this._toasterSrv.showToast(
									Localization.someThingWentWrong,
									"error-toaster"
								);
							},
						});
				}
				this.isProcessLoading = false;
			},
			error: e => {
				this.isProcessLoading = false;
				this._toasterSrv.showToast(this.localization.someThingWentWrong, "error-toaster");
			},
		});
	}

	assignDirectoryStructure(entityType: string, entityName: string, id: number) {
		this.docVisuService
			.assignDirectoryStructure(entityName, entityType, id, this.directory)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data: any) => {
					this.processId = data.id;
					this.machineId = id;
					this.directory = data;
				},
				error: e => {
					this._toasterSrv.showToast(
						this.localization.someThingWentWrong,
						"error-toaster"
					);
				},
			});
	}

	selectOperation(operation: any) {
		throw new Error("Method not implemented.");
	}

	selectOrder(order: any) {
		throw new Error("Method not implemented.");
	}

	selectTool(id: number) {
		if (!id) return;
		this.isProcessLoading = true;
		this.toolId = id;
		const request$ = this.getStructureByQuery$(id, BackendModelType.TOOL);
		request$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (directoryStructures: any) => {
				if (directoryStructures.length > 0) {
					const directoryStructure = directoryStructures[0];
					this.processId = directoryStructure.id;
				} else {
					const selectedTool = this.tools.find(tool => tool.id === id);
					this.toolName = selectedTool ? selectedTool.name : `Tool ${id}`;

					this.docVisuService
						.get(`DocumentSections?$filter=model_type eq 'App\\Models\\Tool'`)
						.pipe(takeUntil(this.destroy$))
						.subscribe({
							next: (response: any) => {
								if (response?.value?.length > 0) {
									const docSection = response.value[0];
									if (docSection.directory_structure_id) {
										this.docVisuService
											.getStructureByFilter(
												`id=${docSection.directory_structure_id}`
											)
											.pipe(takeUntil(this.destroy$))
											.subscribe({
												next: (data: any) => {
													if (data?.length > 0) {
														this.docSectionStructure = data[0];
														this.getStructureWithDirectories(
															this.docSectionStructure.id,
															this.toolName,
															BackendModelType.TOOL
														);
													} else {
														this.assignDirectoryStructure(
															this.toolName,
															BackendModelType.TOOL,
															id
														);
													}
												},
												error: () => {
													this._toasterSrv.showToast(
														Localization.someThingWentWrong,
														"error-toaster"
													);
												},
											});
									} else {
										this._toasterSrv.showToast(
											$localize`No directory structure ID found in DocumentSection`,
											"error-toaster"
										);
									}
								} else {
									this._toasterSrv.showToast(
										$localize`No matching DocumentSection found for Tool`,
										"error-toaster"
									);
								}
							},
							error: () => {
								this._toasterSrv.showToast(
									Localization.someThingWentWrong,
									"error-toaster"
								);
							},
						});
				}
				this.isProcessLoading = false;
			},
			error: () => {
				this.isProcessLoading = false;
				this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
			},
		});
	}

	trackItemById(index: number, item: any): number {
		return item.id;
	}

	getStructureWithDirectories(id: number, entityName: string, modelName: string) {
		this.docVisuService
			.getStructureWithDirectories(id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (structure: any) => {
					this.directory = undefined;
					this.directory = structure;
					let sectionId: number;
					if (modelName === BackendModelType.MACHINE) {
						sectionId = this.machineId;
					} else if (modelName === BackendModelType.ITEM) {
						sectionId = this.itemId;
					} else if (modelName === BackendModelType.TOOL) {
						sectionId = this.toolId;
					} else {
						sectionId = this.docSectionStructure.id;
					}
					this.docVisuService
						.assignDirectoryStructure(entityName, modelName, sectionId, this.directory)
						.pipe(takeUntil(this.destroy$))
						.subscribe({
							next: (data: any) => {
								this.processId = data.section;
								if (modelName === BackendModelType.MACHINE) {
									this.machineId = id;
								} else if (modelName === BackendModelType.ITEM) {
									this.itemId = id;
								} else if (modelName === BackendModelType.TOOL) {
									this.toolId = id;
								}
							},
						});
				},
				error: e => {
					this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
				},
			});
	}

	selectItem(id: number) {
		if (!id) return;
		this.isProcessLoading = true;
		this.itemId = id;
		const request$ = this.getStructureByQuery$(id, BackendModelType.ITEM);
		request$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (directoryStructures: any) => {
				if (directoryStructures.length > 0) {
					const directoryStructure = directoryStructures[0];
					this.processId = directoryStructure.id;
				} else {
					const selectedItem = this.items.find(item => item.id === id);
					this.itemName = selectedItem ? selectedItem.name : `Item ${id}`;

					this.docVisuService
						.get(`DocumentSections?$filter=model_type eq 'App\\Models\\Item'`)
						.subscribe({
							next: (response: any) => {
								if (
									response?.value &&
									Array.isArray(response.value) &&
									response.value.length > 0
								) {
									const docSection = response.value[0];
									if (docSection.directory_structure_id) {
										this.docVisuService
											.getStructureByFilter(
												`id=${docSection.directory_structure_id}`
											)
											.subscribe({
												next: (data: any) => {
													if (data && data.length > 0) {
														this.docSectionStructure = data[0];
														this.getStructureWithDirectories(
															this.docSectionStructure.id,
															this.itemName,
															BackendModelType.ITEM
														);
													} else {
														this.assignDirectoryStructure(
															this.itemName,
															BackendModelType.ITEM,
															id
														);
													}
												},
												error: e => {
													this._toasterSrv.showToast(
														Localization.someThingWentWrong,
														"error-toaster"
													);
												},
											});
									} else {
										this._toasterSrv.showToast(
											$localize`No directory structure ID found in DocumentSection`,
											"error-toaster"
										);
									}
								} else {
									this._toasterSrv.showToast(
										$localize`No matching DocumentSection found for Item`,
										"error-toaster"
									);
								}
							},
							error: e => {
								this._toasterSrv.showToast(
									Localization.someThingWentWrong,
									"error-toaster"
								);
							},
						});
				}
				this.isProcessLoading = false;
			},
			error: e => {
				this.isProcessLoading = false;
				this._toasterSrv.showToast(this.localization.someThingWentWrong, "error-toaster");
			},
		});
	}

	getStructureByQuery$(modelId: any, modelType: any) {
		let id = modelId;
		let model = modelType;

		if (model && id) {
			return this.docVisuService.getStructureByFilter(
				`sectionable_type=${model}&sectionable_id=${id}`
			);
		}
		return of([]);
	}

	closeDialogDocVisuProcessDetailsPage() {
		this.isDialogOpen = false;
		this.router.navigate(["../"], { relativeTo: this.activeRoute });
	}
}
