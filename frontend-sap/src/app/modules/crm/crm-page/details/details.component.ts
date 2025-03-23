import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Customer } from "@app/shared/models/customer.model";
import { Localization } from "@app/shared/utils/common-localize";
import { User } from "@app/shared/models/user.model";
import { RevenueClassification } from "@app/shared/models/revenue-classification.model";
import { MachineClassification } from "@app/shared/models/machine-classification.model";
import { EmployeeClassification } from "@app/shared/models/employee-classification.model";
import { PotentialClassification } from "@app/shared/models/potential-classification.model";
import { MarketSegment } from "@app/shared/models/market-segment.model";
import { SalesStatus } from "@app/shared/models/sales-status.model";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { Country } from "@app/shared/models/country.model";
import { CommonService } from "@app/shared/services/common.service";
import { AuthService } from "@app/shared/services/auth.service";
import { ConfigService } from "@app/shared/services/config.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { ContactComponent } from "../contact/contact.component";
import { AttachmentComponent } from "../attachment/attachment.component";
import { OverviewComponent } from "../overview/overview.component";
import { Chat } from "@app/shared/models/chat.model";
import { DeliveryTerm } from "@app/shared/models/delivery-term.model";
import { PaymentTerm } from "@app/shared/models/payment-term.model";
import { SalesArea } from "@app/shared/models/sales-area.model";
import { SalesGroup } from "@app/shared/models/sales-group.model";
import { CustomerGroup } from "@app/shared/models/customer-group.model";
import { Sector } from "@app/shared/models/sector.model";
import { Message } from "@app/shared/models/message.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { CustomerCategory } from "@app/shared/models/customer-category.model";

@Component({
	selector: "app-details",
	templateUrl: "./details.component.html",
	styleUrl: "./details.component.css",
})
export class DetailsComponent {
	@Input() public selectedCustomer: Customer = new Customer().deserialize({});
	@Input() public dialogTitle = "";
	@Input() public isDialogOpen!: boolean;
	@Input() public customId!: string;
	@Input() public users!: User[];

	@Input() public revenueClassifications: RevenueClassification[] = [];
	@Input() public machineClassifications: MachineClassification[] = [];
	@Input() public employeeClassifications: EmployeeClassification[] = [];
	@Input() public potentialClassifications: PotentialClassification[] = [];
	@Input() public marketSegments: MarketSegment[] = [];
	@Input() public salesStatuses: SalesStatus[] = [];
	@Input() public country: Country[] = [];
	@Input() public category: CustomerCategory[] = [];

	@Output() closeCRMDialog = new EventEmitter();
	@Output() filterHandler = new EventEmitter();
	@Output() customerUpdated = new EventEmitter<{
		id: number | undefined;
		date_follow_up: string | undefined;
		sales_status_id: number | null;
	}>();

	@Input() public set customer(customerId: number) {
		if (customerId) {
			this.loadFullData(customerId);
		} else {
			this.getCustomId();
		}
	}

	public selectedTab: string = "overviewTab";
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.idIsRequired;
	isConfirmationModalOpen = false;
	confirmationText = $localize`All unsaved changes will be lost. Are you sure?`
	disableButtonDuringRequest: boolean = false;
	isUpdate?: boolean = false;
	localization = Localization;
	cachedCustomId?: string = "";
	isLoading: boolean = false;
	customerConfig?: any = {};

	isLoadingCustomId: boolean = false;

	@ViewChild("createOrUpdateForm") form?: NgForm;
	@ViewChild("attachmentComponent") attachmentComponent?: AttachmentComponent;
	@ViewChild("overviewComponentRef") overviewComponent?: OverviewComponent;
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	@ViewChild("contactComponentRef", { static: false }) contactComponentRef:
		| ContactComponent
		| undefined;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService
	) {
		this.customerConfig = this.configService.getConfigValue("customers");
	}

	ngAfterViewInit(): void {
		// this.getCustomId();
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("Customer").catch(() => false);
		this.selectedCustomer.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedCustomer.custom_id = "";
		this.isLoadingCustomId = false;
	}

	onSubmit(form: NgForm) {
		if ((!form.valid && form.form.errors) || !this.selectedCustomer.name || !this.selectedCustomer.custom_id) {
			this.disableButtonDuringRequest = false;
			this.selectedTab = !this.selectedCustomer.name
				? 'overviewTab'
				: !this.selectedCustomer.custom_id
				? 'customerTab'
				: this.selectedTab;
			return;
		}

		this.isUpdate = this.selectedCustomer.id ? true : false;
		const customId = this.selectedCustomer.custom_id?.trim();
		this.selectedCustomer.custom_id = customId;

		if (this.isUpdate && this.cachedCustomId === customId) {
			this.selectedCustomer.id ? this.onCreateOrUpdate() : this.createEntryForChat();
		} else {
			this.checkCustomId();
		}
	}

	loadFullCusData() {
		this.loadFullData(this.selectedCustomer.id ?? 0);
	}

	shouldBeDisabled(fieldName: string) {
		if (this.customerConfig && this.selectedCustomer) {
			return this.customerConfig[fieldName] === 0 && this.customerConfig.is_imported_from_erp;
		} else {
			return false;
		}
	}

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
	}

	onUpdateDate(e: any) {
		this.selectedCustomer.date_follow_up = e.target.value;
	}

	onUpdateDateSourced(e: any) {
		this.selectedCustomer.date_sourced = e.target.value;
	}

	onBeforeClose(event: any) {
		if (event.detail.escPressed) {
			event.preventDefault();
		}
		else {
			this.closeDialog();
		}
	}

	closeDialog() {
		this.isConfirmationModalOpen = false
		this.isDialogOpen = false;
		(this.form as any).onReset();

		this.closeCRMDialog.emit();
		this.selectedTab = "overviewTab";
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedCustomer.custom_id || ""
		);
		const urlString = `Customers?$filter=custom_id eq '${this.selectedCustomer.custom_id}'&$select=custom_id`;
		if (result.success) {
			this.commonService.get(urlString).subscribe({
				next: (response: any) => {
					if (response.value.length === 0) {
						if (this.selectedCustomer.id) {
							this.onCreateOrUpdate();
						} else {
							this.createEntryForChat();
						}
					} else {
						this.disableButtonDuringRequest = false;
						this.customIdState = "Negative";
						this.customIdValueStateText = $localize`Id is already taken.`;
					}
				},
				error: () => {
					this.disableButtonDuringRequest = false;
				},
			});
		} else {
			this.disableButtonDuringRequest = false;
			this.customIdState = "Negative";
			this.customIdValueStateText = result.msg;
		}
	}

	loadFullData(id: number) {
		this.isLoading = true;
		this.commonService
			.get(
				`Customers(${id})?$expand=contactable($expand=contact),marketSegment,deliveryTerm,paymentTerm,salesArea,salesGroup,customerGroup,country,sector,salesStatus,responsibleUser,revenueClassification,machineClassification,category,employeeClassification,potentialClassification,media,chat($expand=messages($expand=sender))`
			)
			.subscribe({
				next: (data: any) => {
					delete data["@context"];
					this.selectedCustomer = new Customer().deserialize(data);
					if (this.selectedCustomer.created_at) {
						this.selectedCustomer.created_at = new Date(this.selectedCustomer.created_at);
					}
					this.cachedCustomId = this.selectedCustomer.custom_id;

					if (this.selectedCustomer?.chat?.id) {
						try {
							this.commonService
								.get(
									`get-customer-data/${this.selectedCustomer?.chat?.id}`,
									false,
									true
								)
								.subscribe({
									next: (response: any) => {
										if (this.selectedCustomer?.chat?.messages) {
											this.selectedCustomer.chat.messages = response;

											this.overviewComponent!.notes = response;
											this.overviewComponent?.groupNotesByDate();
										}
									},
									error: error => {
										console.error(error);
									},
								});
						} catch (error) {
							console.error(error);
						}
					}
					this.isLoading = false;
				},
			});
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedCustomer?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate ? `Customers(${this.selectedCustomer?.id})` : `Customers`;
		this.commonService[method](urlString, payload).subscribe({
			next: async (res: any) => {
				delete res["@context"];

				this._toasterSrv.showToast(
					$localize`Customer data is saved successfully!`,
					"success"
				);
				await this.contactComponentRef?.saveContactsToCustomer({...this.selectedCustomer, id: res.id});
				await this.attachmentComponent?.saveItemAttachments({...this.selectedCustomer, id: res.id});

				// for getting the original url of the last saved attachments
				this.attachmentComponent?.reuseableAttachmentRef?.ngOnInit();
				this.selectedCustomer.id = res.id;

				this.customerUpdated.emit({
					id: this.selectedCustomer.id,
					date_follow_up: this.selectedCustomer.date_follow_up,
					sales_status_id: this.selectedCustomer.salesStatus?.id || null,
				});

				this.filterHandler.emit();
				this.disableButtonDuringRequest = false;

				this.loadFullData(res.id);
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
			},
		});
	}

	createEntryForChat() {
		const payload = new Chat().deserialize({});
		const messages = structuredClone(this.selectedCustomer.chat?.messages || []);

		this.commonService.post("Chats", payload.toOdata()).subscribe({
			next: (res: any) => {
				if (this.selectedCustomer.chat) this.selectedCustomer.chat.id = res?.id;
				if (messages.length) this.syncMessagesForNewCustomer(messages, res?.id);

				this.onCreateOrUpdate();
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
			},
		});
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	onChangeIsActive(event: any) {
		if (this.selectedCustomer) this.selectedCustomer.is_active = event.target.checked;
	}

	onChangeDeliveryTerm(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.deliveryTerm = new DeliveryTerm().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}

	onChangeName(event: any) {
		if (this.selectedCustomer) this.selectedCustomer.name = (event.target as any).value;
	}
	onChangePaymentTerm(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.paymentTerm = new PaymentTerm().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}

	onChangeSalesAreas(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.salesArea = new SalesArea().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}

	onChangeSalesGroup(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.salesGroup = new SalesGroup().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}

	onChangeUser(event: any) {
		if (this.users) {
			this.selectedCustomer.responsibleUser = new User().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}

	onChangeMarketSegment(event: any) {
		if (this.marketSegments) {
			this.selectedCustomer.marketSegment = new MarketSegment().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}

	onChangeSalesStatus(event: any) {
		if (this.salesStatuses) {
			this.selectedCustomer.salesStatus = new SalesStatus().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}

	onChangeCustomerGroup(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.customerGroup = new CustomerGroup().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}

	onChangeCountry(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.country = new Country().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}

	onChangeSectors(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.sector = new Sector().deserialize({
				name: (event.target as any).value,
				id: parseInt((event.detail as any).item.id),
			});
		}
	}

	onChangeNotes(note: any) {
		this.selectedCustomer.note = note;
	}

	syncMessagesForNewCustomer(messages: Message[], chatId: number) {
		let requests: ODataBatchCall[] = [];

		messages?.forEach((message: any, i: number) => {
			const batchCall = new ODataBatchCall(i, "POST", `\/odata\/Messages`);

			message.chat.id = chatId;
			const newMessage = new Message().deserialize(message);
			const payload = newMessage.toOdata();

			batchCall.body = payload;
			requests.push(batchCall);
		});

		if (requests.length) {
			return new Promise((resolve, reject) => {
				try {
					this.commonService.post("$batch", { requests }).subscribe({
						next: response => {
							resolve(response);
						},
						error: error => {
							console.log(error);
						},
					});
				} catch (error) {
					reject(error);
				}
			});
		} else return Promise.resolve({});
	}

	refreshGridTable(message: any) {
		this.overviewComponent?.refreshActonLogs();
		if (this.childComponent) {
			const data = this.childComponent.data;
			const index = data.findIndex((data: Customer) => data.id == this.selectedCustomer?.id);

			if (this.childComponent.data[index].chat.messages)
				this.childComponent.data[index].chat.messages.push(message);

			this.childComponent.render();
		}
	}

	onCountryInputChange(event: any) {
		const inputValue = event.target.value;
		const matchCountryData = this.country.find(country => country.name === inputValue);
		if (!matchCountryData && this.selectedCustomer?.country) {
			this.selectedCustomer.country = new Country().deserialize({
				id: null,
				name: "",
			});
		}
	}

	goToWebsite() {
		if (!this.shouldBeDisabled("website")) {
			window.open(this.selectedCustomer?.website, "_blank");
		}
	}
}
