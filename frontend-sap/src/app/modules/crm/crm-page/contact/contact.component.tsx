import { Component, ViewChild, Input, Output, EventEmitter } from "@angular/core";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { CommonService } from "@app/shared/services/common.service";
import { AuthService } from "@app/shared/services/auth.service";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { Contact } from "@app/shared/models/contact.model";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { Customer } from "@app/shared/models/customer.model";
import { Contactable } from "@app/shared/models/contactable.model";
import { NgForm } from "@angular/forms";
import React from "react";
import { Button, FlexBox, Icon } from "@ui5/webcomponents-react";
import { DatePipe } from "@angular/common";
import { Chat } from "@app/shared/models/chat.model";
import { Message } from "@app/shared/models/message.model";
import { CrmActionLogsComponent } from "@app/modules/crm/crm-action-logs/crm-action-logs.component";
interface NoteGroup {
	date: Date;
	notes: Message[];
}
@Component({
	selector: "app-contact",
	templateUrl: "./contact.component.html",
	styleUrl: "./contact.component.css",
})
export class ContactComponent {
	@Input() public selectedCustomer!: Customer;

	isUpdate?: boolean;
	isDialogOpen: boolean = false;
	isLoading: boolean = false;
	dialogTitle: string = "";
	contact: Contact = new Contact().deserialize({});
	contactable: Contactable = new Contactable().deserialize({});
	isContactDialogOpen: boolean = false;
	isContactCreate: boolean = false;
	showActivityDialog: boolean = false;
	addText: string = Localization.add;
	editText: string = Localization.edit;
	activeText: string = Localization.active;
	idText: string = Localization.id;
	indexesForSyncContactableContacts: number[] = [];
	someThingWentWrong: string = Localization.someThingWentWrong;
	doYouWantToDeleteThisRecord: string = Localization.doYouWantToDeleteThisRecord;
	associateDialogTitle: string = Localization.add;
	localization = Localization;
	isContactEmptyDialogOpen: boolean = false;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	notes: Message[] = [];
	groupedNotes: NoteGroup[] = [];
	@Output() loadFullCustomerData = new EventEmitter<void>();
	@Output() refreshGridTable = new EventEmitter<any>();
	@ViewChild(CrmActionLogsComponent) crmActionLogsComponent!: CrmActionLogsComponent;
	
	topValue: number = 1000;
	allContacts: Contactable[] = [];
	deletedContactables: number[] = [];
	contactColumns: any = [
		{
			Header: $localize`Last Name`,
			accessor: "contact.last_name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			hAlign: "Left",
			autoResizable: true,
		},
		{
			Header: $localize`First Name`,
			accessor: "contact.first_name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			hAlign: "Left",
			autoResizable: true,
		},
		{
			Header: $localize`Main Addressee`,
			accessor: ".",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Center",
			Cell: (instance: {
				cell: any;
				row: any;
			}) => {
				const { row } = instance;
				const rowData = row.original;
				const isMainAddressee = rowData.contact.is_main_addressee;
				return (
					<React.StrictMode>
						<FlexBox>
							 <Icon name={isMainAddressee ? "accept" : "decline"} />
						</FlexBox>
					</React.StrictMode>
				)
			}
		},
		{
			Header: $localize`Email`,
			accessor: "contact.email",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`Mobile`,
			accessor: "contact.mobile",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`Telephone`,
			accessor: "contact.telephone",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`Role Description`,
			accessor: "contact.role_description",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`LinkedIn`,
			accessor: "contact.linkedin",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
			Cell: ({ value }: { value: string }) => {
				if (value?.length > 0) {
					return (
						<React.StrictMode>
							<a
								href={value} target="_blank" rel="noopener noreferrer"> {value}
							</a>
						</React.StrictMode>
					);
				} else return null;
			},
		},
		{
            Header: $localize`Action`,
	    accessor: "action",
	    isSelected: true,
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            hAlign: "Center",
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const {row} = instance;
                const rowData = row.original;

                return (
                    <React.StrictMode>
                        <FlexBox style={{gap: "5px"}}>
                            { rowData.contact_id ?
                                <Button
                                    id="contactBtn"
                                    onClick={() => this.contactClick(rowData)}
                                    icon="add-activity"
								/>
								: <></>
							}
                            {
                                <Button
                                    id="editButton"
                                    onClick={() => this.editContables(rowData)}
                                    icon="edit"
                                />
                            }
                            {
                                <Button
                                    id="deleteButton"
                                    onClick={() => this.deleteContables(rowData)}
                                    icon="delete"
                                />
                            }
                        </FlexBox>
                    </React.StrictMode>
                );
            },
        },
	];

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	@ViewChild("errorDialogSVK", { static: false }) errorDialogSVK: any;
	@ViewChild("deleteToastTools", { static: false }) deleteToastTools: any;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService,
		private _datePipe: DatePipe
	) {}

	ngOnInit() {}

	async ngOnChanges(changes: any) {
		if (changes.selectedCustomer) {
			this.indexesForSyncContactableContacts = [];
			this.deletedContactables = [];
			this.allContacts = [];

			this.allContacts = changes.selectedCustomer?.currentValue?.contactable?.map(
				(contactable: Contactable) => new Contactable().deserialize(contactable)
			);
		}
	}

	closeActivityDialog() {
		this.isDialogOpen = false;		
	}

	onSave() {
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			return;
		}
		this.onContactableSave();
	}

	associateButtonClick() {
		this.indexesForSyncContactableContacts = [];
		this.deletedContactables = [];

		this.isContactDialogOpen = true;
		this.isContactCreate = true;
		this.associateDialogTitle = Localization.add;

		this.contact = new Contact().deserialize({});
		this.contactable = new Contactable().deserialize({
			contactable_type: "App\\Models\\Customer",
			contactable_id: this.selectedCustomer?.id,
		});
	}

	contactClick(value: any) {
		this.isDialogOpen = true;
		this.crmActionLogsComponent?.newButtonClick();
		this.contact = structuredClone(value?.contact || {});
	}

	onActionLogCreated(event: any) {
		const createdAt = this._datePipe.transform(new Date(event.log_date), "dd.MM.yyyy, HH:mm");
		const actionName = event.crmAction?.name || "Unknown Action";
		const note = event.note ? `\n \n${event.note}` : "";

		const messageContent = `${createdAt} - ${actionName}${note}`;
		if (!this.selectedCustomer.chat?.id) {
			const payload = new Chat().deserialize({});
			this.commonService.post("Chats", payload.toOdata()).subscribe({
				next: (newChat: any) => {
					this.commonService
						.put(`Customers(${this.selectedCustomer?.id})`, { chat_id: newChat.id })
						.subscribe({
							next: (updatedCustomers: any) => {
								this.selectedCustomer = new Customer().deserialize(
									updatedCustomers
								);
								this.addActionLogMessage(messageContent);
							},
							error: error => {},
						});
				},
				error: (error: Error) => {
					console.error(error);
				},
			});
		} else {
			this.addActionLogMessage(messageContent);
		}
	}

	addActionLogMessage(content: string) {
		if (content) {
			const message = new Message().deserialize({
				sender: this.authService.loggedInUser || {},
				content: content,
				chat: this.selectedCustomer.chat,
			});
			this.notes.push(message);
			this.groupNotesByDate(); // Group notes by date after adding a new note
			if (message.chat?.id) {
				this.commonService.post("Messages", message.toOdata()).subscribe({
					next: (res: any) => {
						message.id = res.id;
						message.sender = this.authService.loggedInUser;
						this.refreshGridTable.emit(message);
						this.loadFullCustomerData.emit();
						if (!this.selectedCustomer.chat?.messages?.length) {
							this.selectedCustomer.chat?.messages.push(message);
						}
					},
					error: (error: Error) => {
						console.error(error);
					},
				});
			} 
		}
	}

	groupNotesByDate() {
		const grouped = this.notes.reduce((groups: any, note: Message) => {
			const date = new Date(note.created_at).toDateString();
			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(note);
			return groups;
		}, {});

		// Convert the grouped object into an array of objects, sort by date, and sort notes within each date
		this.groupedNotes = Object.keys(grouped)
			.map(date => ({
				date: new Date(date),
				notes: grouped[date].sort(
					(a: Message, b: Message) =>
						new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
				),
			}))
			.sort((a, b) => a.date.getTime() - b.date.getTime());
	}

	editContables(value: any) {
		this.indexesForSyncContactableContacts = [];
		this.deletedContactables = [];

		this.contactable = structuredClone(value);
		Object.keys(value?.contact).forEach(
			key => (value!.contact[key] = value?.contact[key] ?? "")
		);
		this.contact = structuredClone(value?.contact || {});
		this.isContactDialogOpen = true;
		this.isContactCreate = false;
		this.associateDialogTitle = Localization.edit;
	}

	cancelDialog() {
		this.contactable = new Contactable().deserialize({});
		this.contact = new Contact().deserialize({});
		this.isContactDialogOpen = false;

		this.childComponent?.render();
	}

	onContactableSave() {
		const isSaveable = this.sanitizeInput(this.contact);

		if (isSaveable) {
			this.contactable.contact = this.contact;
			if (this.contactable?.contact?.is_main_addressee) {
				this.allContacts.forEach((item: any, i: any) => {
					if (item.contact?.is_main_addressee) {
						this.allContacts[i]!.contact!.is_main_addressee = false;
					}
				})
			}
			if (this.isContactCreate) {
				this.contactable.id = Math.floor(Math.random() * 1000000) * -1;
				this.allContacts.push(structuredClone(this.contactable));
			} else {
				const index = this.allContacts.findIndex(
					(contactable: Contactable) => contactable.id == this.contactable.id
				);
				this.allContacts[index] = this.contactable;
			}
			this.isContactDialogOpen = false;
			this.contactable = new Contactable().deserialize({});
			this.contact = new Contact().deserialize({});
			this.childComponent?.render();
		} else {
			this.errorDialogSVK.elementRef.nativeElement.open = true;
			this._toasterSrv.showToast($localize`All fields are empty!`, "error");
		}
	}

	sanitizeInput(contact: any) {
		for (const key in contact) {
			if (contact.hasOwnProperty(key)) {
				const value = contact[key];				
				if (typeof value === "string") {
					const trimmedValue = value?.trim();
					if (trimmedValue.length > 0) {
						return true;
					}
				} else if (typeof value === "boolean") {
					return true;
				}
			}
		}
		return false;
	}

	disabledMainAddressee() {
		if (this.contact?.is_main_addressee) {
			return false;
		}
		return this.allContacts?.length ? this.allContacts.some((data) => data.contact?.is_main_addressee) : false;
	}

	async saveContactsToCustomer(customer: any) {
		this.allContacts.map((contactable: Contactable) => {
			if (!contactable.contactable_id) {
				contactable.contactable_id = customer.id;
				return contactable;
			} else return contactable;
		});

		await this.syncContactsToCustomer()
			.then((res: any) => {
				let requests: ODataBatchCall[] = [];

				this.indexesForSyncContactableContacts?.forEach((syncIndex: number, i: number) => {
					const batchCall = new ODataBatchCall(i, "POST", `\/odata\/ContactableContacts`);

					if (res?.responses[syncIndex]?.body?.id) {
						const payload = {
							contactable_type: "App\\Models\\Customer",
							contactable_id: customer?.id,
							contact_id: res?.responses[syncIndex]?.body?.id,
						};

						batchCall.body = payload;

						requests.push(batchCall);
					}
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
			})
			.catch(err => console.log(err));
	}

	syncContactsToCustomer() {
		let requests: ODataBatchCall[] = [];
		let currentIndex = 0;

		this.deletedContactables?.forEach((activityTypeId: number) => {
			const batchCall = new ODataBatchCall(
				currentIndex,
				"delete",
				`\/odata\/ContactableContacts(${activityTypeId})`
			);

			requests.push(batchCall);
			currentIndex++;
		});

		this.allContacts.forEach((contactable: Contactable) => {
			if (contactable.id && contactable.id < 0) {
				contactable.id = undefined;
			}
			if (contactable.id) {
				const payload = new Contact().deserialize(contactable.contact).toOdata();

				const batchCall = new ODataBatchCall(
					currentIndex,
					"PUT",
					`\/odata\/Contacts(${contactable.contact?.id})`
				);
				batchCall.body = payload;

				requests.push(batchCall);
				currentIndex++;
			} else {
				const batchCall = new ODataBatchCall(currentIndex, "POST", `\/odata\/Contacts`);
				batchCall.body = contactable.contact;
				this.indexesForSyncContactableContacts.push(currentIndex);

				requests.push(batchCall);
				currentIndex++;
			}
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

	deleteContables(value: any) {
		if (value.id) {
			this.deletedContactables.push(value.id);

			this.allContacts = this.allContacts.filter(
				(activityType: any) =>
					!(activityType.pos === value.pos && activityType.id === value.id)
			);
		} else {
			this.allContacts = this.allContacts.filter(
				(activityType: any) => JSON.stringify(activityType) != JSON.stringify(value)
			);
		}

		this.childComponent?.render();
	}

	closeDialog() {
		this.isDialogOpen = false;
	}

	closeErrorDialog() {
		this.errorDialogSVK.elementRef.nativeElement.open = false;
	}

	filterHandler(fieldName: string = "", value: string = "", filterOperator: string = "Contain") {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
	}
}
