import { Component, OnInit, Input, inject, Output, EventEmitter, ComponentRef, ViewChild, ViewContainerRef } from '@angular/core';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { Notification } from 'src/app/shared/services/notification.service';
import { GridColumn } from '@app/shared/models/grid-column.model';
import { MyNewRequestComponent } from './my-new-request/my-new-request.component';
import { RequestService } from '../../services/request.service';
import { AbsenceStatus, AbsenceStatusClass } from '@app/enums/absence-status';
import { DialogAction, DialogThemeColor } from "@progress/kendo-angular-dialog";
import { AbsenceRequest } from '../../models/new-request';
import { GridDataResult, RowClassArgs } from "@progress/kendo-angular-grid";
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { UserTypes } from '@app/enums/user-type'
import { readCookie } from '@app/shared/helpers/read-cookie';
import { AbsenceManagerPageType } from '@app/enums/absence-manager-page-type';
import { AbsenceManagerFilterType, AbsenceManagerFilterTypeClass } from '@app/enums/absence-manager-filter-type'
import { IntlService } from '@progress/kendo-angular-intl';
@Component({
	selector: 'app-request-table',
	templateUrl: './request-table.component.html',
	styleUrls: ['./request-table.component.scss']
})
export class RequestTableComponent extends GridProperty implements OnInit {
	@Input() pageType!: string;
	public columns: any;
	public toolbarConfig: any;
	public cmpRef!: ComponentRef<any>;
	public selectedData?: AbsenceRequest;
	public statusEnum = AbsenceStatus;
	public statusEnumClass = new AbsenceStatusClass();
	public absenceManagerPageTypes = AbsenceManagerPageType;
	public userTypeEnum = UserTypes;
	public filterEnum = AbsenceManagerFilterType;
	public totalHourDependentValue: number = 8;
	public dialogThemeColor: DialogThemeColor = "primary"
	public modalTitle = $localize`Absence Request`
	grid!: GridComponent
	@Input() set data(dataItem: any) {
		this.selectedData = new AbsenceRequest().deserialize(dataItem);
	}
	public userData: any
	public opened = false;


	public editView = {
		actionButton: "",
		modalWidth: "37.56vw",
		modalTemplate: MyNewRequestComponent,
		hasRemoveCommand: false,
		hasRemovedCommandIcon: false,
		hasEditCommandIcon: false,
		hasEditCommand: false,
		isCustomizedHandler: true,
		isOnPageFilter: false,
		isAbsenceType: true,
		isHiddenActionColumn: false,
		windowCustomTitle : $localize `New Request`
	};
	public isRequestPage?: boolean;
	public isWindowLoaderEnabled = false;
	@ViewChild('modalBody', { read: ViewContainerRef }) modalBody!: ViewContainerRef;
	public dropDownData = [
		{
			name: AbsenceManagerFilterTypeClass.getStateTranslate(this.filterEnum.ASSIGNED_EMPLOYEE), value: this.filterEnum.ASSIGNED_EMPLOYEE
		},
		{
			name: AbsenceManagerFilterTypeClass.getStateTranslate(this.filterEnum.ALL_EMPLOYEE), value: this.filterEnum.ALL_EMPLOYEE
		}
	]
	public gridDataFilterDropdown = this.dropDownData[0].value;



	public gridDataFilterRadio = this.filterEnum.ALL
	constructor(public intl: IntlService, _commonService: CommonService, private requestService: RequestService, private notification: Notification,
	) {
		super(_commonService)
	}
	ngOnInit(): void {
		this.userData = this.authService.user
		if (this.selectedData == undefined) {
			this.selectedData = new AbsenceRequest();
			this.selectedData.user = this.authService.user;
		}
		this.state.take = 20
		this.requestService.absenceManagerPageType = this.pageType
		this.columns = this.getColumns(this.pageType);

		if (this.pageType === AbsenceManagerPageType.MYABSENCE) {
			this.isRequestPage = false;
			this.url = `AbsenceRequests?$filter=user_id eq ${this.authService.user.id}&$expand=user($expand=supervisorOne,supervisorTwo),approvedBy,absenceType&$orderby=created_at desc`
			this.toolbarConfig = {
				title: $localize`My Absences`,
				hasAddCommand: true,
				hasSearch: false
			}
			this.requestService.isNewRequestModal = true;
		} else if (this.pageType === AbsenceManagerPageType.REQUEST) {
			this.isRequestPage = true;
			this.editView.isHiddenActionColumn = true;

			this.url = `AbsenceRequests?$filter=(user_id ne ${this.authService.user.id}) and ((user/any(a:a/supervisor1_user_id eq ${this.authService.user.id}) or user/any(a:a/supervisor2_user_id eq ${this.authService.user.id})))&$expand=user,approvedBy,absenceType&$orderby=created_at desc&`


			this.toolbarConfig = {
				title: $localize`Incoming Absence Requests`,
				hasAddCommand: false,
				hasSearch: true
			}
		}
		this.sendRequest();

	}

	changeDropdownData() {
		switch (this.gridDataFilterDropdown) {

			case this.filterEnum.ASSIGNED_EMPLOYEE:
				if (this.gridDataFilterRadio === this.filterEnum.ALL) {
					this.url = `AbsenceRequests?$filter=user_id ne ${this.authService.user.id} and (user/any(a:a/supervisor1_user_id eq ${this.authService.user.id}) or user/any(a:a/supervisor2_user_id eq ${this.authService.user.id}))&$expand=user,approvedBy,absenceType&$orderby=created_at desc`
				}
				else if(this.gridDataFilterRadio === this.filterEnum.PENDING) {

					this.url = `AbsenceRequests?$filter
					=user_id ne ${this.authService.user.id} and (user/any(a:a/supervisor1_user_id eq ${this.authService.user.id}) or user/any(a:a/supervisor2_user_id eq ${this.authService.user.id})) and status eq '${this.gridDataFilterRadio}' or status eq 'REVOKE'&$expand=user,approvedBy,absenceType&$orderby=created_at desc`
					
				}else{
					this.url = `AbsenceRequests?$filter
					=user_id ne ${this.authService.user.id} and (user/any(a:a/supervisor1_user_id eq ${this.authService.user.id}) or user/any(a:a/supervisor2_user_id eq ${this.authService.user.id})) and status eq '${this.gridDataFilterRadio}'&$expand=user,approvedBy,absenceType&$orderby=created_at desc`
				}
				break;
			case this.filterEnum.ALL_EMPLOYEE:
				this.url = `AbsenceRequests?$filter=user_id ne ${this.authService.user.id}&$expand=user,approvedBy,absenceType&$orderby=created_at desc`
				if (this.gridDataFilterRadio === this.filterEnum.ALL) {
					this.url = `AbsenceRequests?$filter=user_id ne ${this.authService.user.id}&$expand=user,approvedBy,absenceType&$orderby=created_at desc`
				}
				else if(this.gridDataFilterRadio === this.filterEnum.PENDING) {
					
					this.url = `AbsenceRequests?$filter=user_id ne ${this.authService.user.id} and status eq '${this.gridDataFilterRadio}' or status eq 'REVOKE'&$expand=user,approvedBy,absenceType&$orderby=created_at desc`
				}else{
					this.url = `AbsenceRequests?$filter=user_id ne ${this.authService.user.id} and status eq '${this.gridDataFilterRadio}'&$expand=user,approvedBy,absenceType&$orderby=created_at desc`
				}
				break;
			default:
				return;
		}
		this.sendRequest();
	}
	getColumns(pageType: string): GridColumn[] {
		let columns = [

			{
				name: "status",
				title: $localize`Status`,
				filterable: true,
				filterType: 'enum',
				dropdownList: new AbsenceStatusClass().getEnumArray(),
				dropdownFilterableList: new AbsenceStatusClass().getEnumArray(),
				isCustomCell: true
			},
			{
				name: "user.name",
				title: $localize`Employee`,
				filterable: true,
				filterType: "multiLayer",
				isCustomCell: false
			},
			{
				name: "updated_at",
				title: $localize`Modification Date`,
				filterType: "date",
				filterable: true,
				isCustomCell: false,
			},
			{
				name: "start",
				title: $localize`Start Date`,
				filterable: true,
				isCustomCell: true,
			},
			{
				name: "end",
				title: $localize`End Date`,
				filterable: true,
				isCustomCell: true
			},

			{
				name: "total_hour",
				title: $localize`Total Hour`,
				filterable: true,
				isCustomCell: true
			},
			{
				name: "approvedBy.name",
				title: $localize`Superior`,
				filterable: true,
				filterType: "multiLayer",
				isCustomCell: false
			},
			{
				name: "absenceType.custom_id",
				title: $localize`Absence Type`,
				filterable: true,
				filterType: "multiLayer",
				isCustomCell: false
			}
		]
		if (pageType === AbsenceManagerPageType.MYABSENCE) {
			columns.splice(1, 1)
		} else {
			columns.splice(8, 8)

		}
		return columns;
	}

	geStatusBackgroundColor(status: string) {
		if (this.pageType === AbsenceManagerPageType.REQUEST && status === AbsenceStatus.PENDING) {
			return { 'background-color': '#00A3EC' }
		}
		return { 'background-color': new AbsenceStatusClass().getColor(status) };

	}
	openDeleteModal(dataItem: any) {
		let status = AbsenceStatus
		this.selectedData = dataItem;
		if (dataItem.status === status.PENDING) {
			this.notification.confirmCustomAction($localize`Warning`, $localize`Delete the Request? The request will be deleted, this cannot be undone.`).subscribe((res: any) => {
				if (res.action == 'next') {
					this.isWindowLoaderEnabled = true;
					this._commonService.get(`AbsenceRequests?filter=id eq ${dataItem.id}`).subscribe({
						next: (res: any) => {
							if (!res.value.length) {
								this.isWindowLoaderEnabled = false;
								return this.notification.showError($localize`Request is Already Deleted`);
							}
							let status = res.value[0].status;
							if (status === AbsenceStatus.APPROVED || status === AbsenceStatus.NOT_APPROVED) {
								this.isWindowLoaderEnabled = false;
								this.notification.showError($localize`Request is Already ${new AbsenceStatusClass().getStateTranslate(status)}`);
							} else {
								let lang = readCookie('sct_language') ?? 'en';
								let url = `absence-manager/email/delete-leave-request/${lang}/${this.selectedData?.id}`
								this._commonService.post(url, {}, false).subscribe({
									next: (res: any) => {
										this.onRemoveItem(`AbsenceRequests(${dataItem.id})`)
										this.isWindowLoaderEnabled = false;
									},
									error: (e: any) => {
										this.onRemoveItem(`AbsenceRequests(${dataItem.id})`)
										this.isWindowLoaderEnabled = false;
									}
								});
							}
						}
					})


				}

			})
		} else if (dataItem.status === status.APPROVED) {
			this.selectedData!.applicant_note = '';
			this.opened = true;
		}

	}
	onAction(action: DialogAction): void {
		this.opened = false;
	}
	onUpdate(req: RequestTableComponent) {
		if (!this.selectedData?.applicant_note) {
			this.notification.showError($localize`Note is Mandatory`);
			return;
		}
		this.isWindowLoaderEnabled = true;
		this._commonService.put(`AbsenceRequests(${this.selectedData?.id})`, { status: AbsenceStatus.REVOKE, is_read: false, applicant_note: this.selectedData?.applicant_note }).
			subscribe({
				next: (res: any) => {
					this.sendMail("revoke-leave-request")
					this.selectedData = undefined
					this.sendRequest();
					this.opened = false;
					this.isWindowLoaderEnabled = false
					this.notification.showSuccess($localize`Data revoke successfully`);
				},
				error: (e: any) => {
					this.isWindowLoaderEnabled = false
					this.notification.showError(e ?? $localize`Something went wrong`);
				}
			})
	}

	sendMail(emailType: string) {
		let lang = readCookie('sct_language') ?? 'en';
		let url = `absence-manager/email/${emailType}/${lang}/${this.selectedData?.id}`
		this._commonService.post(url, {}, false).subscribe();
	}

	close(status: string): void {
		this.opened = false;
	}
	updateCalculationHandler(event: PointerEvent) {
		this.cmpRef.instance.onUpdate(event, this)
	}

	public cancelHandler(): void {
		this.selectedData = undefined;
	}
	openRequestDetailsModal(dataItem: any) {
		this.selectedData = dataItem.dataItem;
		this.selectedData!.pageName = this.pageType;
		this.selectedData!.isDetailsModal = true;
		this.selectedData = new AbsenceRequest().deserialize(this.selectedData)
		if (this.pageType === AbsenceManagerPageType.REQUEST) {
			this.requestService.isAcceptOrDeclaineModal = true;
			if (!this.selectedData.is_read) {
				dataItem.dataItem.is_read = true
				this.selectedData.is_read = true;
				let url = `AbsenceRequests(${this.selectedData.id})`
				this._commonService.put(url, { is_read: true }).subscribe({
					next: (response) => {
						this.gridItems.data.map((data: AbsenceRequest) => {
							if (data.id === this.selectedData?.id) data.is_read = true;
						})
					}
				})
			}
			if (this.selectedData.status === AbsenceStatus.REVOKE) {
				dataItem.dataItem.supervisor_note = '';
			}
		}else{
			this.requestService.isAcceptOrDeclaineModal = false;
		}
		
		if (this.requestService.isAcceptOrDeclaineModal) {
			if (dataItem.dataItem.status === AbsenceStatus.APPROVED || dataItem.dataItem.status === AbsenceStatus.NOT_APPROVED || dataItem.dataItem.status === AbsenceStatus.REVOKED) {
				this.requestService.isRequestActionButtonsVisible = false;
			} else {
				this.requestService.isRequestActionButtonsVisible = true;
			}
		}
	}

	ngOnDestroy(): void {
		this.requestService.isNewRequestModal = false;
		this.requestService.isRequestActionButtonsVisible = false;
	}
	override  sendRequest(urlFilter?: string): void {
		this.isLoadedEnabled = true;
		this._commonService.getLodata(this.state, this.url, urlFilter).subscribe({
			next: (response: GridDataResult) => {
				this.gridItems = [];
				let data: AbsenceRequest[] = [];
				response.data.forEach(element => {
					data.push(new AbsenceRequest().deserialize(element))
				})
				this.gridItems = {
					data: data,
					total: response.total
				}
				this.isLoadedEnabled = false;
			},
			error: (e) => this.isLoadedEnabled = false
		});
	}
	override changeGridFilter(data: any) {
		let stateQuery: string = typeof (data) != 'string' ? data.query : data;

		if (data.hasOwnProperty('state') && !data.hasOwnProperty('type')) this.state = data.state;
		else if (typeof (data) != 'string' && (data.type == 'relational-data' || data.type == 'fullGridSearch')) {
			if (data.hasOwnProperty('state') && this.state != data.state) {
				this.state = data.state;
			}
			let tempState: any = '';
			if (this.pageType === AbsenceManagerPageType.MYABSENCE) {
				tempState = `user_id eq ${this.authService.user.id}`
			} else {
				if (this.gridDataFilterDropdown === this.filterEnum.ALL_EMPLOYEE && this.gridDataFilterRadio === this.filterEnum.ALL) {
					tempState = `user_id ne ${this.authService.user.id}`
				} else {
					tempState = `user_id ne ${this.authService.user.id} and (user/any(a:a/supervisor1_user_id eq ${this.authService.user.id}) or user/any(a:a/supervisor2_user_id eq ${this.authService.user.id}))`
				}
			}

			if (stateQuery) {
				stateQuery = tempState + ' and ' + stateQuery;
			} else {
				stateQuery = tempState;
			}
		}

		if (stateQuery != '' && stateQuery != undefined) this.sendRequest(stateQuery);
		else this.sendRequest();
	}

	public rowCallback = (context: RowClassArgs) => {
		if (this.pageType === this.absenceManagerPageTypes.REQUEST && context.dataItem.is_read == 0) {
			return { 'bold-text': true };
		}
		return { 'bold-text': false };
	};

}
