import { Component, ViewChild, Input as NgInput } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CustomReactGridTable, GridTableColumnDataType } from '@app/shared/components/CustomGridTable';
import { MachineConstraintType, MachineConstraintTypeClass } from "@app/shared/enums/MachineConstraintType";
import { ProdOrder } from '@app/shared/models/prod-order.model';
import { AuthService } from '@app/shared/services/auth.service';
import { CommonService } from '@app/shared/services/common.service';
import { ToastService } from '@app/shared/services/toaster.service';
import { Localization } from '@app/shared/utils/common-localize';
import ValueState from '@ui5/webcomponents-base/dist/types/ValueState';
import React from 'react';
import { ComboBoxItem, FlexBox, Text } from '@ui5/webcomponents-react';
import { ComboBox, DateTimePicker, Input as UI5Input, Input, Icon } from "@ui5/webcomponents-react";
import { DatePicker } from '@ui5/webcomponents-react';
import { ProdOrderPos } from '@app/shared/models/prod-order-pos.model';
import { ProdOrderPosOperation } from '@app/shared/models/prod-order-pos-operation.model';
import moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-create-order',
	templateUrl: './create-order.component.html',
	styleUrl: './create-order.component.css'
})
export class CreateOrderComponent {
	@NgInput() selectedMachineId?: number | undefined = undefined;
	@NgInput() onFinalSave?: any;

	@ViewChild("createOrUpdateForm") form?: NgForm;
	@ViewChild("errorDialogProdOrder", { static: false }) errorDialogProdOrder: any;
	@ViewChild("prodOrderGrid", { static: false }) prodOrderGrid:
		| CustomReactGridTable
		| undefined;
	@ViewChild("prodOrderPosGrid", { static: false }) prodOrderPosGrid:
		| CustomReactGridTable
		| undefined;
	@ViewChild("prodOrderPosOperationGrid", { static: false }) prodOrderPosOperationGrid:
		| CustomReactGridTable
		| undefined;
	@ViewChild("callOffsValuEHelperGrid", { static: false }) callOffsValuEHelperGrid:
		| CustomReactGridTable
		| undefined;
	@ViewChild("valuEHelperGrid", { static: false }) valuEHelperGrid:
		| CustomReactGridTable
		| undefined;
	@ViewChild("machineValuEHelperGrid", { static: false }) machineValuEHelperGrid:
		| CustomReactGridTable
		| undefined;
	prodOrderAllData: ProdOrder[] = [];
	customIdValueStateText: string = Localization.idIsRequired;
	isLoadingCustomId: boolean = false;
	isLoading: boolean = false;
	dialogTitle: string = "";
	isDialogOpen: boolean = false;
	customId?: string;
	selectedProdOrder: ProdOrder = new ProdOrder().deserialize({});
	customIdState: keyof typeof ValueState = "None";
	localization = Localization;
	orderCustomid?:string = '';
	isItemValueHelpDialog = false;
	isMachineValueHelpDialog = false;
	isCallOffValueHelpDialog = false;
	valueHelperTitle = $localize `Items`
	machineValueHelperTitle = $localize `Machines`
	callOffseValueHelperTitle = $localize `CallOffs`
	valueHelperUrl = '/Items'
	valueHelperCustomUrl = '/plan_visu/get_items_with_customer';
	callOffsCustomUrl = '/plan_visu/get_call_offs_with_customer';
	selectItem: any;
	selectItemId: any;
	valueForItem: any;
	positionTableRowData: any;
	selectedPositionIndex: any;
	operationTableRowData:any = {};
	selectMachine: any;
	selectedPosRow: any = {};
	isDeleteModalOpen = false;
	isDeleteModalLoading = false;
	isFinalSave =false;
	selectedOrderForDelete?:any;
	selectedOrderIndexForDelete?:any;
	selectedPositionIndexForDelete: any;
	selectedOperationIndexForDelete: any;
	isOperationExistModalOpen = false;
	operationExistModalText = $localize `Your Existing Data May Replace! Do you want to Procced?`
	deleteModalText = ''
	deleteModalType=''
	selectedCallOff:any = {};
	finalSelectedCallOff:any = {};
	positionPos = 0;
	machineFilterQuery = '';
	positionAddButtonDisable = true
	operationAddButtonDisable = true
	isFinalDataDisabled = false;
	callOffsDateRange: any;
	callOffsStartDate: any = moment.now();
	callOffsEndDate: any = moment.now();
	callOffsExpandedInitialQuery = '$expand=item($expand=operationPlan($expand=operationPlanPos($expand=machine)),customer)';
	callOffsExpandedQuery = this.callOffsExpandedInitialQuery;
	callOffType = 'unused'
	internalFilterType = 'all'
	callOffsDateRangePickerPlaceholder = '';
	isBatchQuantity = false;
	internalFilterItems = {
			textAccessor: "name",
			idAccessor: "id",
			data: [
				{ id: '1', name: $localize`All`, key: 'all' },
				{ id: '2', name: $localize`Yes`, key: 'internal' },
				{ id: '3', name: $localize`No`, key: 'not_internal' }
			]
		};
	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private _datePipe: DatePipe,
		public _toasterSrv: ToastService
	) {
		this.callOffsEndDate = moment(this.callOffsStartDate).add(1, 'month');
		const start = moment(this.callOffsStartDate).format('YYYY-MM-DD');
		const end = moment(this.callOffsEndDate).format('YYYY-MM-DD');
		this.callOffsDateRangePickerPlaceholder = `${moment(this.callOffsStartDate).format('DD/MM/YYYY')} - ${moment(this.callOffsEndDate).format('DD/MM/YYYY')}`;

		this.callOffsCustomUrlFilter = {
			page: 0,
			globalSearchValue: '',
			transportOrderPosCustomUrl: '',
			customUrl: '',
			start: start,
			end: end,
		};

		this.callOffsCustomUrl = this.updateCallOffsCustomerApiUrl();

		this.selectedProdOrder = new ProdOrder().deserialize({});
	}
	ngAfterViewInit(): void {
		this.removeFocusableFromHiddenElements();
		if(this.prodOrderAllData.length){
			this.prodOrderGrid!.selectedRowsId = {0:true}
			this.customId = this.prodOrderAllData[0].custom_id
			this.orderCustomid = this.prodOrderAllData[0].custom_id
			this.positionAddButtonDisable = false;
			if(this.prodOrderAllData[0].prodOrderPos?.length){
				this.positionPos = Math.max(
					...this.prodOrderAllData[0].prodOrderPos.map((pos:any) => pos.pos)
				  );
				  
				this.operationAddButtonDisable = false;
				this.selectedPositionIndex = 0;
				this.prodOrderPosGrid!.data = this.prodOrderAllData[0].prodOrderPos;
				this.prodOrderPosGrid!.selectedRowsId = {0:true};
				this.selectedPosRow.index = 0
				this.selectedPosRow.original = this.prodOrderPosGrid!.data[0];
				if(this.prodOrderAllData[0].prodOrderPos[0].prodOrderPosOperations.length){
					this.prodOrderPosOperationGrid!.data = this.prodOrderAllData[0].prodOrderPos[0].prodOrderPosOperations
				}
				this.prodOrderPosGrid?.render();
				this.prodOrderPosOperationGrid?.render();
			}else{
				this.prodOrderPosGrid!.data = [];
				this.prodOrderPosOperationGrid!.data = [];
				this.prodOrderPosGrid?.render();
				this.prodOrderPosOperationGrid?.render();
			}
			
		}
	}

	ngOnInit(): void {
		const storedData = localStorage.getItem('orderData');
		if (storedData) {
		  this.prodOrderAllData = JSON.parse(storedData); 
		} else {
		  this.prodOrderAllData = [];
		}
		window.addEventListener('focus', (event) => { this.removeFocusableFromHiddenElements(); },true);
	}
	public removeFocusableFromHiddenElements(): void {
		const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
		hiddenElements.forEach((item) => {
			item.setAttribute('aria-hidden', 'false');
			item.removeAttribute('aria-hidden');
		});
	}
	ngOnDestroy(){
		if(this.prodOrderAllData.length){
			localStorage.setItem('orderData', JSON.stringify(this.prodOrderAllData));
		}else{
			if(localStorage.getItem('orderData')){
				localStorage.removeItem('orderData')
			}
		}
	}

	columns: any = [
		{
			Header: $localize`Order Id`,
			accessor: "custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		}
	]
	segmentButtonItems = [{ id: '1', name: $localize`No Orders` }, { id: '2', name: $localize`With Orders` }]
	segmentButtonChange(event:any){
		if (event.detail.selectedItems[0].id == "1"){
			this.callOffType = 'unused'
		}else{
			this.callOffType = 'used'
		}
		this.callOffsCustomUrlFilter.page = 0;
		if (this.callOffsValuEHelperGrid) {
			this.callOffsValuEHelperGrid.customUrl = this.updateCallOffsCustomerApiUrl();
			this.callOffsValuEHelperGrid.onPagination(true);
		}
	}
	interlFilter(event:any){
		this.callOffsCustomUrlFilter.page = 0;
		switch(event.detail.item.id){
			case '1':
				this.internalFilterType = 'all'
				break;
			case '2':
				this.internalFilterType = 'internal'
				break;
			case '3':
				this.internalFilterType = 'not_internal'
				break;
			default:
				this.internalFilterType = 'all';
		}
		if (this.callOffsValuEHelperGrid) {
			this.callOffsValuEHelperGrid.customUrl = this.updateCallOffsCustomerApiUrl();
			this.callOffsValuEHelperGrid.onPagination(true);
		}
	}

	closeErrorDialog() {
		this.errorDialogProdOrder.elementRef.nativeElement.open = false;
	}
	prodOrderPosColumns: any = [
		{
			Header: $localize`Pos`,
			accessor: "pos",
			isSelected: true,
			hAlign: "Left",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			width: 40,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				return (
					<React.StrictMode>
						<UI5Input
							type="Number"
							value={row.original.pos}
							onChange={(event)=>{
								row.original.pos = event.target.value;
							}}
						/>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Item`,
			accessor: "item.custom_id",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Start",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<Input
							icon={<Icon name="add" />}
							value={rowData?.item?.custom_id}
							onClick={() =>{
								this.positionTableRowData = rowData;
								this.openItemValueHepler(row) }}
							type="Text"
							valueState="None"
							/>

					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Due Date`,
			accessor: "due_date",
			hAlign: "Right",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			dataType: GridTableColumnDataType.Date,
			Cell: (instance: { cell: any; row: any }) => {
				const { row } = instance;
				return (
					<React.StrictMode>
						<DatePicker
							format-pattern="dd.MM.yyyy"
							value={row.original.due_date ? row.original.due_date : ''}
							onChange={(event)=>{
								row.original.due_date = event.detail.value;
								this.dueDateUpdate(row.original.due_date, row.original.quantity)
							}}
						/>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Quantity`,
			accessor: "quantity",
			isSelected: true,
			hAlign: "Start",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			width: 80,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				return (
					<React.StrictMode>
						<UI5Input
							type="Number"
							value={row.original.quantity}
							onChange={(event)=>{
								row.original.quantity = event.target.value;
								this.posQuantityChange(row.original.quantity)
							}}
						/>
					</React.StrictMode>
				);
			},
		},
	]

	prodOrderPosOperationsColumns: any = [
		{
			Header: $localize`Pos`,
			accessor: "pos",
			isSelected: true,
			hAlign: "Left",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			width:80,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				return (
					<React.StrictMode>
						<UI5Input
							type="Number"
							value={row.original.pos}
							onChange={(event)=>{
								row.original.pos = event.target.value;
							}}
						/>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Machine`,
			accessor: "machine",
			isSelected: true,
			hAlign: "Start",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			width: 250,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<Input
							icon={<Icon name="add" />}
							value={rowData?.machine?.name}
							onClick={() =>{
								this.operationTableRowData = rowData;
								this.openMachineModal()

								 }}
							type="Text"
							valueState="None"
							/>

					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Constraint Type`,
			accessor: "constraint_type",
			isSelected: true,
			hAlign: "Start",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			width: 250,
		
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
				const rowData = row.original;
        
				return (
					<React.StrictMode>
						<FlexBox>
							<ComboBox
								value={MachineConstraintTypeClass.getStateTranslate(rowData?.constraint_type)}
								onInput={()=>{}}
								onSelectionChange={(e:any)=>{rowData.constraint_type = MachineConstraintTypeClass.getStateValue(e.detail.item.text); this.prodOrderPosOperationGrid?.render()
								}}
							>
								{MachineConstraintTypeClass.getEnumArray().map((type: any) => (
									<ComboBoxItem key={type.value} id={type.value} text={type.text} />
								))}
							</ComboBox>
						</FlexBox>
					</React.StrictMode>
				);
            },
		},
		{
			Header: $localize`Start Date`,
			accessor: "start",
			isDateColumn: true,
			filterType: "date",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Right",
			width: 250,
			dataType: GridTableColumnDataType.Date,
			Cell: (instance: { cell: any; row: any }) => {
				const { row } = instance;
				return (
					<React.StrictMode>
						<DatePicker
						format-pattern="dd.MM.yyyy HH:mm"
						readonly={(row.original.constraint_type != MachineConstraintType.CONSTRAINT) && (row.original.constraint_type != MachineConstraintType.MANUAL)}
						value={row.original.start ? row.original.start : ''}
						onChange={(event)=>{
							row.original.start = event.detail.value;
							this.updateAllOperationsStartAndEnd(row.original)
						}}
						show-time-picker
						/>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`End Date`,
			accessor: "end",
			isDateColumn: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Right",
			width: 250,
			dataType: GridTableColumnDataType.Date,
			Cell: (instance: { cell: any; row: any }) => {
				const { row } = instance;
				return (
					<React.StrictMode>
						<DatePicker
						format-pattern="dd.MM.yyyy HH:mm"
						value={row.original.end ? row.original.end : ''}
						readonly={true}
						onChange={(event)=>{
							row.original.end = event.detail.value;
						}}
						show-time-picker
						/>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`TE(Seconds)`,
			accessor: "te",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
			width:100,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				return (
					<React.StrictMode>
						<UI5Input
							type="Number"
							value={row.original.te}
							onChange={ (event:any) =>{
								row.original.te = event.target.value;
								this.updateAllOperationsStartAndEnd(row.original)
							}}
						/>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Cavity`,
			accessor: "cavity",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
			width: 100,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				return (
					<React.StrictMode>
						<UI5Input
							type="Number"
							value={row.original.cavity}
							onChange={(event)=>{
								row.original.cavity = event.target.value;
								this.updateAllOperationsStartAndEnd(row.original)
							}}
						/>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Lead Time Days`,
			accessor: "lead_time_days",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
			width:100,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				return (
					<React.StrictMode>
						<UI5Input
							type="Number"
							value={row.original.lead_time_days}
							onChange={ (event:any) =>{
								row.original.lead_time_days = event.target.value;
								this.operationTableRowData = row.original;
								this.updateAllOperationsStartAndEnd(this.operationTableRowData)
							}}
						/>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Send Ahead Quantity`,
			accessor: "send_ahead_quantity",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
			width:100,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				return (
					<React.StrictMode>
						<UI5Input
							type="Number"
							value={row.original.send_ahead_quantity}
							onChange={ (event:any) =>{
								row.original.send_ahead_quantity = event.target.value;
								this.operationTableRowData = row.original;
								this.updateAllOperationsStartAndEnd(this.operationTableRowData)
							}}
						/>
					</React.StrictMode>
				);
			},
		},
	]
	openMachineModal(){
		if(this.operationTableRowData?.is_genarated && this.operationTableRowData?.machine?.machine_group_id){
			this.machineFilterQuery = `machine_group_id eq ${this.operationTableRowData?.machine?.machine_group_id}`
		}else{
			this.machineFilterQuery = ''
		}
		this.isMachineValueHelpDialog = true;
	}
	async updateOperationEndDate(rowData:any){
		const duration =
		(rowData.te / (rowData.cavity ? rowData.cavity : 1)) * this.selectedPosRow.original.quantity;
	  	// Await API response
	  	let res: any = await firstValueFrom(
			this.commonService.get(
			`capacity-plan/machine/${rowData.machine.id}?start=${rowData.start}&duration=${duration}`,
			false
			)
	  	);
		let index = this.prodOrderPosOperationGrid?.data.findIndex((item:any) => item.pos == rowData.pos);
		this.prodOrderPosOperationGrid!.data[index].end =  moment(res.end).format('DD.MM.YYYY HH:mm');
		setTimeout(() => {
			this.prodOrderPosOperationGrid?.render();
		});
	}
	updateAllOperationsStartAndEnd(rowData:any){
		let data = {
			pos: rowData.pos,
			machine_id: rowData.machine.id,
			start:  moment(rowData.start, "DD.MM.YYYY HH:mm").toISOString(),
			operations: this.prodOrderPosOperationGrid!.data,
			quantity: this.selectedPosRow.original.quantity,
			constraint_type: rowData.constraint_type
		}
		this.commonService.post(
			  `plan_visu/constrainged_operation_date`,
			  data,
			  false
			).subscribe({
				next: (res:any)=>{
					if(res.length > 0){
						this.prodOrderPosOperationGrid?.data.forEach((op:any, index:any)=>{
							const matchingRes = res.find((r: any) => r.pos === op.pos);
							if (matchingRes) {
								op.start = moment(matchingRes.start).format('DD.MM.YYYY HH:mm');
								op.end = moment(matchingRes.end).format('DD.MM.YYYY HH:mm');
							}
						})
					}
					this.prodOrderPosOperationGrid!.render();
				}
			})
		this.updateOperationEndDate(rowData);
	}
	posQuantityChange(quantity:any){
		if(this.prodOrderPosOperationGrid?.data?.length > 0){
			this.prodOrderPosOperationGrid?.data?.forEach(async (element:any) => {
				let duration = (element.te / (element.cavity ? element.cavity : 1)) * quantity;
				let res: any = await firstValueFrom(
					this.commonService.get(
					  `capacity-plan/machine/${element.machine.id}?start=${element.start}&duration=${duration}`,
					  false
					)
				  );
				  element.end = moment(res.end).format('DD.MM.YYYY HH:mm');
				  this.prodOrderPosOperationGrid?.render()
			});
		}

	}
	updateOperationStartandEndDate(data:any){
		let start: any = new Date(
			this.selectedPosRow.original.due_date.split('.').reverse().join('-')
		  );
		  start.setDate(start.getDate() - data.lead_time_days);
		  start = moment(start).format('DD.MM.YYYY HH:mm');
		  this.operationTableRowData.start =  start;
		  this.prodOrderPosOperationGrid?.render()
		  this.updateOperationEndDate(this.operationTableRowData);
	}
	dueDateUpdate(dueDate:any, quantity:any){
		this.prodOrderPosOperationGrid?.data?.forEach((ele:any)=>{
			let date:any = new Date(dueDate.split(".").reverse().join("-"));
			date.setDate(date.getDate() - 40);
			date = moment(date).format('DD.MM.YYYY HH:mm');
			ele.start = date;
		})
		this.posQuantityChange(quantity)
	}
	newButtonClick() {
		this.positionPos = 0;
		this.dialogTitle = this.localization.add;
		this.selectedProdOrder = new ProdOrder().deserialize({});
		this.customIdState = "None";
		this.isDialogOpen = true;
		this.getCustomId();
	}
	callOffDataProcess(e:any){
		if(this.finalSelectedCallOff.custom_id && this.finalSelectedCallOff.custom_id !=''){
			let index = this.callOffsValuEHelperGrid?.data.findIndex((item:any) => item.id == this.finalSelectedCallOff?.id);
			this.callOffsValuEHelperGrid!.selectedRowsId = {[index]: true}
			this.callOffsValuEHelperGrid!.render();
		}
	}
	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("ProdOrder").catch(() => false);
		this.selectedProdOrder.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedProdOrder.custom_id = "";
		this.isLoadingCustomId = false;
	}
	positionNewButtonClick(){
		this.positionPos = this.positionPos + 10;
		let matchingIndex = -1
		this.prodOrderAllData.forEach((order, index) => {
			if (order.custom_id === this.orderCustomid) {
			  matchingIndex = index;
			  // Perform additional operations here, e.g., push data to prodOrderPos
			  order.prodOrderPos = order.prodOrderPos || []; // Initialize if undefined
			  order.prodOrderPos.push(new ProdOrderPos().deserialize({pos:this.positionPos}));
			  this.operationAddButtonDisable = false;
			}
		  });

		this.prodOrderPosGrid!.data = this.prodOrderAllData[matchingIndex]?.prodOrderPos;
		this.prodOrderPosGrid!.selectedRowsId = {0: true};
		this.selectedPositionIndex = 0;
		setTimeout(() => {
			this.prodOrderPosGrid?.render();
		});
	}
	async operationNewButtonClick(type: string, copyData: any) {
		let orderIndex = -1;

		for (const [index, order] of this.prodOrderAllData.entries()) {
		  if (order.custom_id === this.orderCustomid) {
			orderIndex = index;

			for (const [posIndex, position] of (order.prodOrderPos ?? []).entries()) {
			  if (posIndex === this.selectedPositionIndex) {
				position.prodOrderPosOperations = position.prodOrderPosOperations || [];

				if (type === 'copy') {
				  position.prodOrderPosOperations = [];
				  for(let i = copyData.length - 1; i>=0; i--){
					const duration =
						(copyData[i].te / (copyData[i].cavity ? copyData[i].cavity : 1)) * this.selectedPosRow.original.quantity;
						if(i == copyData.length - 1){
							let end: any = new Date(
								this.selectedPosRow.original.due_date.split('.').reverse().join('-')
							  );
							  end.setDate(end.getDate() - copyData[i].lead_time_days);
							  end = moment(end).format('DD.MM.YYYY HH:mm');
							  copyData[i].end = end
							  let res: any = await firstValueFrom(
								this.commonService.get(
								  `capacity-plan/start/${copyData[i].machine?.id}?end=${moment(end, "DD.MM.YYYY HH:mm", true).toISOString()}&duration=${duration}`,
								  false
								)
							  );
							  let start:any = moment(res.start).format('DD.MM.YYYY HH:mm')
							  copyData[i].start = start
							  position.prodOrderPosOperations.push(
								new ProdOrderPosOperation().deserialize({
								  operation_plan_id_origin: copyData[i].operation_plan_id,
								  name: copyData[i].name ? copyData[i].name : `operation_${copyData[i].operation_plan_id}`,
								  pos: copyData[i].pos,
								  machine: copyData[i].machine,
								  te: copyData[i].te,
								  tr: copyData[i].tr,
								  start: start,
								  end: end,
								  quantity: this.selectedPosRow.original.quantity,
								  cavity: copyData[i].cavity ? copyData[i].cavity : 1,
								  is_genarated: true,
								  lead_time_days: copyData[i].lead_time_days,
								  send_ahead_quantity: 0,
								  constraint_type: copyData[i].machine ? copyData[i].machine.constraint_type : '',
								}))
						}else{
							let end: any = moment(position.prodOrderPosOperations[position.prodOrderPosOperations.length - 1]?.start , 'DD.MM.YYYY HH:mm');
							  end.subtract(copyData[i].lead_time_days, 'days');
							  end = moment(end).format('DD.MM.YYYY HH:mm');
							  let res: any = await firstValueFrom(
								this.commonService.get(
								  `capacity-plan/start/${copyData[i].machine?.id}?end=${moment(end, "DD.MM.YYYY HH:mm", true).toISOString()}&duration=${duration}`,
								  false
								)
							  );
							  let start:any = moment(res.start).format('DD.MM.YYYY HH:mm')
							  position.prodOrderPosOperations.push(
								new ProdOrderPosOperation().deserialize({
								  operation_plan_id_origin: copyData[i].operation_plan_id,
								  name: copyData[i].name ? copyData[i].name : `operation_${copyData[i].operation_plan_id}`,
								  pos: copyData[i].pos,
								  machine: copyData[i].machine,
								  te: copyData[i].te,
								  tr: copyData[i].tr,
								  start: start,
								  end: end,
								  quantity: this.selectedPosRow.original.quantity,
								  cavity: copyData[i].cavity ? copyData[i].cavity : 1,
								  is_genarated: true,
								  lead_time_days: copyData[i].lead_time_days,
								  send_ahead_quantity: 0,
								  constraint_type: copyData[i].machine.constraint_type,
								}))
						}
				  }
				  position.prodOrderPosOperations?.sort((a:any, b:any) => a.pos - b.pos);
				  
				} else {
					let start = position.prodOrderPosOperations.length ? moment(position.prodOrderPosOperations[position.prodOrderPosOperations.length - 1].end, 'DD.MM.YYYY HH:mm')
					.add(1, 'minutes')
					.format('DD.MM.YYYY HH:mm') :moment().format('DD.MM.YYYY HH:mm')
					let end =  moment(start, 'DD.MM.YYYY HH:mm')
					.add(15, 'minutes')
					.format('DD.MM.YYYY HH:mm')
				  if (
					this.selectedPosRow?.original?.item &&
					this.selectedPosRow?.original?.quantity &&
					this.selectedPosRow?.original?.due_date
				  ) {
					const maxPos = position.prodOrderPosOperations.length
					  ? Math.max(...position.prodOrderPosOperations.map(op => Number(op.pos) || 0))
					  : 0;

					position.prodOrderPosOperations.push(
					  new ProdOrderPosOperation().deserialize({
						start: start,
						end: end,
						name: 'operation',
						quantity: this.selectedPosRow.original.quantity,
						cavity: 1,
						tr:0,
						te:0,
						pos: maxPos + 10,
						is_genarated: false,
						send_ahead_quantity: 0
					  })
					);
				  } else {
					const errMsg = $localize `Please Insert Required Data`;
					this._toasterSrv.showToast(errMsg, 'error');
				  }
				}
			  }
			}
		  }
		}

		// Update the grid data
		if (orderIndex !== -1) {
		  this.prodOrderPosOperationGrid!.data =
			this.prodOrderAllData[orderIndex]!.prodOrderPos![this.selectedPositionIndex].prodOrderPosOperations;
		}

		if (type === 'copy') {
		  this.prodOrderPosOperationGrid!.isBusy = false;
		  this.operationAddButtonDisable = false;
		  if ( this.prodOrderPosOperationGrid?.data.length == 0) {
			 this._toasterSrv.showToast($localize `No Genarated Operations`,'error')
		  }
		  this.prodOrderPosOperationGrid!.render();
		  this.isFinalDataDisabled = false;
		}
	  }

	prodOrderGridRowClick(event:any){
		this.orderCustomid = event.detail.row.original.custom_id;
		this.prodOrderPosGrid!.data = this.prodOrderAllData[event.detail.row.index]?.prodOrderPos;
		this.positionPos =this.prodOrderPosGrid!.data.length ? this.prodOrderPosGrid!.data[this.prodOrderPosGrid!.data.length - 1].pos : 0;
		this.prodOrderPosGrid?.render();

		this.prodOrderPosOperationGrid!.data =  [];
		this.prodOrderPosOperationGrid!.render();
		if( this.prodOrderAllData[event.detail.row.index]?.prodOrderPos!.length > 0){
			this.prodOrderPosGrid!.selectedRowsId = {0: true}
			if(this.prodOrderAllData[event.detail.row.index].prodOrderPos![0].prodOrderPosOperations?.length){
				this.prodOrderPosOperationGrid!.data = this.prodOrderAllData[event.detail.row.index].prodOrderPos![0].prodOrderPosOperations
			}else{
				this.prodOrderPosOperationGrid!.data = []
			}
			this.prodOrderPosOperationGrid!.render();
		}
		this.operationAddButtonDisable = this.prodOrderAllData[event.detail.row.index]?.prodOrderPos!.length > 0 ? false : true;
	}
	positionGridRowClick(event:any){
		let matchingIndex = -1;
		this.prodOrderAllData.forEach((order, index) => {
			if (order.custom_id === this.orderCustomid) {
			  matchingIndex = index;
			}
		  });
		this.prodOrderPosOperationGrid!.data = this.prodOrderAllData[matchingIndex]!.prodOrderPos![event.detail.row.index].prodOrderPosOperations;
		this.selectedPositionIndex = event.detail.row.index;
		this.selectedPosRow = event.detail.row;
		this.prodOrderPosOperationGrid?.render();
	}

	operationDataFetch(selectedPosRow:any){
		let item = selectedPosRow.original.item;
		if(item.operation_plan_id !=null){
			let modifyPlans = item.operationPlan?.operationPlanPos?.map((opPos:any) => ({
				...opPos
			  }));
			  modifyPlans?.sort((a:any, b:any) => a.pos - b.pos);
			  this.operationNewButtonClick('copy', modifyPlans);
		}else{
			let modifyPlans:any = [];
			this.operationNewButtonClick('copy', modifyPlans);
		}
	}

	changeBatchQuantityFlag(){
		if(this.isBatchQuantity){
			this.isBatchQuantity = false;
		}else{
			this.isBatchQuantity = true
		}
		
	}
	async onSave() {
		if(this.selectedProdOrder.custom_id == ''){
			this.isLoading = false;
			this._toasterSrv.showToast($localize `Please Insert Id`, 'error')
			return;
		}
		this.prodOrderAllData.unshift(this.selectedProdOrder);
		this.isLoading = false;
		this.isDialogOpen = false;
		this.prodOrderGrid!.data = this.prodOrderAllData
		this.prodOrderGrid!.selectedRowsId = { 0: true };
		this.positionAddButtonDisable = false;
		this.operationAddButtonDisable = true;
		if(this.finalSelectedCallOff &&  Object.keys(this.finalSelectedCallOff).length != 0 && this.finalSelectedCallOff.custom_id !=''){
			let due_date = moment(this.selectedCallOff.date).format("DD.MM.YYYY");
			this.positionPos +=10;
			this.prodOrderAllData[0]?.prodOrderPos?.push(new ProdOrderPos().deserialize({pos:this.positionPos,item:this.finalSelectedCallOff.item, quantity:(this.finalSelectedCallOff.item.batch_quantity && this.isBatchQuantity) ? this.finalSelectedCallOff.item.batch_quantity : this.finalSelectedCallOff.quantity, due_date:due_date}))
			this.operationAddButtonDisable = false;
		}
		this.prodOrderPosGrid!.data = this.prodOrderAllData[0]?.prodOrderPos;
		if(this.prodOrderPosGrid!.data.length > 0){
			this.prodOrderPosGrid!.selectedRowsId = {0: true}
			this.selectedPositionIndex = 0;
			this.selectedPosRow.index = 0
			this.selectedPosRow.original = this.prodOrderPosGrid!.data[0];
		}
		this.prodOrderGrid?.render();
		this.orderCustomid = this.selectedProdOrder?.custom_id ?? this.orderCustomid;
		this.prodOrderPosGrid?.render();
		this.prodOrderPosOperationGrid!.data = []
		this.prodOrderPosOperationGrid?.render();
		this.selectedCallOff = {}
		this.finalSelectedCallOff = {}
		this.isBatchQuantity = false
	}

	closeDialog() {
		this.selectedCallOff = {};
		this.finalSelectedCallOff = {};
		this.isDialogOpen = false;
		this.isBatchQuantity = false
	}
	// VALUE HELPER CODE
	valueHelperColumns: any = [
		{
			Header: $localize`ID`,
			accessor: "custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Name`,
			accessor: "name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Item Name 2`,
			accessor: "name2",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Customer`,
			accessor: "customer",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				const customer = rowData.customer;
				let customerName: string = '';
				if (customer.length > 0) {
					customerName = customer[0].name;
				}
				return (
					<React.StrictMode>
						<>
							<Text>
								{customerName}
							</Text>
						</>
					</React.StrictMode>
				);
			},
		},
	]
	machineValueHelperColumns: any = [
		{
			Header: $localize`Id`,
			accessor: "custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Name`,
			accessor: "name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
	]
	callOffsValueHelperColumns: any = [
		{
			Header: $localize`Item Id`,
			accessor: "item.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Customer`,
			accessor: "item.customer",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				const customer = rowData.item.customer;
				let customerName: string = '';
				if (customer.length > 0) {
					customerName = customer[0].name;
				}
				return (
					<React.StrictMode>
						<>
							<Text>
								{customerName}
							</Text>
						</>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Item`,
			accessor: "item.name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Item Name`,
			accessor: "item.name2",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Quantity`,
			accessor: "quantity",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Date`,
			accessor: "date",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				const date = this._datePipe.transform(rowData.date, 'dd/MM/yyyy');
				return (
					<React.StrictMode>
						<>
							<Text>
								{date}
							</Text>
						</>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Recurring`,
			accessor: "is_internal",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",			
			dataType: GridTableColumnDataType.Boolean,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
				  <React.StrictMode>
					<FlexBox alignItems='Stretch'>
						<Icon name={rowData?.is_internal ? "accept" : "decline"}/>
					</FlexBox>
				  </React.StrictMode>
				);
			},  
		},
	]

	openItemValueHepler(selectedParentData:ProdOrderPos) {
		this.selectedPosRow = selectedParentData
		this.selectedPositionIndex = this.selectedPosRow?.index
		this.isItemValueHelpDialog = true
		this.valueHelperCustomUrlFilter = {
			page: 0,
			globalSearchValue: '',
			transportOrderPosCustomUrl: '',
			customUrl: '',
		};
	}
	valueHelperGridRowClick(event:any){
		this.selectItem = event.detail.selectedFlatRows;
	}
	machineValueHelperGridRowClick(event:any){
		this.selectMachine = event.detail.selectedFlatRows;
	}
	callOffsValueHelperGridRowClick(event:any){
		this.selectedCallOff = event.detail.row.original;
		this.selectedProdOrder.call_off_id = this.selectedCallOff.id
	}
	onSaveCallOff(){
		this.finalSelectedCallOff = { ...this.selectedCallOff };
		this.isCallOffValueHelpDialog = false; 
	}	
	openCallOffDialog(){
		this.internalFilterType = 'all';
		this.isCallOffValueHelpDialog = true;
	}
	closeCallOffDialog(){
		if(!this.finalSelectedCallOff.id){
			this.selectedCallOff = {};
			this.selectedCallOff.custom_id= ''
			this.selectedProdOrder.call_off_id = undefined;
		}

		this.callOffsCustomUrl
		this.isCallOffValueHelpDialog = false;

		this.callOffsEndDate = moment(this.callOffsStartDate).add(1, 'month');
		const start = moment(this.callOffsStartDate).format('YYYY-MM-DD');
		const end = moment(this.callOffsEndDate).format('YYYY-MM-DD');
		this.callOffsDateRangePickerPlaceholder = `${moment(this.callOffsStartDate).format('DD/MM/YYYY')} - ${moment(this.callOffsEndDate).format('DD/MM/YYYY')}`;

		this.callOffsCustomUrlFilter = {
			page: 0,
			globalSearchValue: '',
			transportOrderPosCustomUrl: '',
			customUrl: '',
			start: start,
			end: end,
		};
	}
	onSaveValueHelpDialog(){
		this.valueForItem = this.selectItem[0].original.custom_id
		this.selectItemId = this.selectItem[0].original.id
		this.isItemValueHelpDialog = false
		this.valueHelperCustomUrlFilter = {
			page: 0,
			globalSearchValue: '',
			transportOrderPosCustomUrl: '',
			customUrl: '',
		};
		this.positionTableRowData.item = this.selectItem[0].original
		this.prodOrderPosGrid?.render();
	}
	extraButtonClick(){
		if(this.prodOrderPosOperationGrid?.data?.length > 0){
			this.isOperationExistModalOpen = true;
		}else{
			this.proceedOperationfetchData();
		}
	}
	proceedOperationfetchData(){
		this.isOperationExistModalOpen =  false;
		if(this.selectedPosRow?.original?.item && this.selectedPosRow?.original?.quantity && this.selectedPosRow?.original?.due_date){
			this.prodOrderPosOperationGrid!.isBusy = true;
			this.operationAddButtonDisable = true
			this.isFinalDataDisabled = true;
			this.operationDataFetch(this.selectedPosRow)
		}else{
			let errMsg = ''
			if(this.selectedPosRow == undefined){
				errMsg = $localize `Please Select Pos Data First`
			}else{
				errMsg = $localize `Please Insert Requires Data`
			}
			this._toasterSrv.showToast(errMsg,'error')
		}
	}
	onSaveMachineValueHelpDialog(){
		this.isMachineValueHelpDialog = false
		this.operationTableRowData.machine = this.selectMachine[0].original
		let start: any = new Date(
			this.selectedPosRow.original.due_date.split('.').reverse().join('-')
		  );
		start.setDate(start.getDate() - this.operationTableRowData?.machine?.lead_time_days);
		start = moment(start).format('DD.MM.YYYY HH:mm');
		this.operationTableRowData.start = start
		this.updateOperationEndDate(this.operationTableRowData);
	}
	checkCustomId() {
		this.isLoading = true;
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedProdOrder.custom_id || ""
		);
		const urlString = `ProdOrders?$filter=custom_id eq '${this.selectedProdOrder.custom_id}'&$select=custom_id`;
		if (result.success) {
			this.commonService.get(urlString).subscribe({
				next: (response: any) => {
					if (response.value.length === 0) this.onSave();
					else {
						this.isLoading = false;
						const { idIsAlreadyTaken } = Localization;
						this.customIdState = "Negative";
						this.customIdValueStateText = idIsAlreadyTaken;
					}
				},
				error: () => {
				},
			});
		} else {
			this.customIdState = "Negative";
			this.customIdValueStateText = result.msg;
		}
	}
	onChangeCustomId() {
		this.customIdState = "None";
	}
	prodOrderDeleteClick(){
		this.isDeleteModalOpen = false;
		this.prodOrderAllData.splice(this.selectedOrderIndexForDelete, 1);
		this.prodOrderGrid!.data = this.prodOrderAllData.length > 0 ? this.prodOrderAllData : [];
		if(this.prodOrderAllData.length > 0 )this.prodOrderGrid!.selectedRowsId = { 0: true };
		this.orderCustomid = this.prodOrderAllData?.length > 0 ? this.prodOrderAllData[0]?.custom_id : ''
		this.prodOrderGrid?.render();
		this.prodOrderPosGrid!.data = this.prodOrderAllData.length > 0 ? this.prodOrderAllData[0]?.prodOrderPos: []
		this.prodOrderPosGrid?.render();
		if(this.prodOrderAllData[0]?.prodOrderPos!.length > 0){
			this.prodOrderPosOperationGrid!.data = this.prodOrderAllData[0]!.prodOrderPos![0].prodOrderPosOperations;
		}else{
			this.prodOrderPosOperationGrid!.data = []
		}
		this.prodOrderPosOperationGrid?.render();
		if(this.prodOrderGrid?.data.length == 0){
			this.positionAddButtonDisable = true;
			this.operationAddButtonDisable = true;
		}
	}
	positionDeleteClick(){
		let orderIndex = this.prodOrderAllData.findIndex((item:any)=>item.custom_id == this.customId);
		this.prodOrderAllData[orderIndex].prodOrderPos?.splice(this.selectedPositionIndexForDelete, 1);
		this.isDeleteModalOpen = false;
		this.prodOrderPosGrid!.data = this.prodOrderAllData[orderIndex].prodOrderPos || []
		if(this.prodOrderPosGrid!.data.length == 0){
			this.selectedPosRow = {}
			this.positionPos = 0;
		}
		this.prodOrderPosGrid?.render()
		this.prodOrderPosOperationGrid!.data =
  		this.prodOrderAllData[orderIndex]?.prodOrderPos?.[0]?.prodOrderPosOperations || [];
		this.operationAddButtonDisable = this.prodOrderPosGrid!.data?.length == 0 ? true : this.operationAddButtonDisable;
		this.prodOrderPosOperationGrid?.render()

	}
	operationDeleteClick(){
		let orderIndex = this.prodOrderAllData.findIndex((item:any)=>item.custom_id == this.customId);
		this.prodOrderAllData?.[orderIndex]?.prodOrderPos?.[this.selectedPosRow.index]?.prodOrderPosOperations?.splice(
			this.selectedOperationIndexForDelete,
			1
		  );
		this.isDeleteModalOpen = false;
		this.prodOrderPosOperationGrid!.data =
  		this.prodOrderAllData[orderIndex]?.prodOrderPos?.[this.selectedPosRow.index]?.prodOrderPosOperations;
		this.prodOrderPosOperationGrid?.render()
	}

	DeleteSelectedData(){
		switch(this.deleteModalType){
			case 'order':
				this.prodOrderDeleteClick()
				break;
			case 'position':
				this.positionDeleteClick()
				break;
			case 'operation':
				this.operationDeleteClick()
				break;
		}
	}

	openDeleteModal(event:any, type:string){
		this.deleteModalType = type;
		if(type == 'order'){
			let index = event.index;
			this.selectedOrderIndexForDelete = index
			this.selectedOrderForDelete = this.prodOrderAllData[index]
			this.selectedProdOrder = this.prodOrderAllData[index]
			this.prodOrderGrid!.selectedRowsId = { [index]: true };
			this.orderCustomid = event.original.custom_id;
			this.prodOrderGrid?.render();
			this.prodOrderPosGrid!.data = this.prodOrderAllData[index]?.prodOrderPos
			this.prodOrderPosGrid?.render();
			this.prodOrderPosOperationGrid!.data = this.prodOrderAllData[index]!.prodOrderPos![0]?.prodOrderPosOperations || [];
			this.prodOrderPosOperationGrid?.render();
			this.deleteModalText = $localize `Do You Want to Delete this Order?`
		}

		if(type == 'position'){
			let index = event.index
			this.selectedPositionIndexForDelete = index
			let orderIndex = this.prodOrderAllData.findIndex((item:any)=>item.custom_id == this.customId);
			this.prodOrderPosGrid!.selectedRowsId = {[event.index]: true};
			this.prodOrderPosOperationGrid!.data = this.prodOrderAllData[orderIndex]!.prodOrderPos![index]?.prodOrderPosOperations || [];
			this.prodOrderPosOperationGrid?.render();
			this.deleteModalText = $localize `Do You Want to Delete this Position?`
		}

		if(type == 'operation'){
			let index = event.index
			this.selectedOperationIndexForDelete = index
			this.prodOrderPosOperationGrid!.selectedRowsId = {[index]: true};
			this.deleteModalText = $localize `Do You Want to Delete this operation?`
		}

		this.isDeleteModalOpen = true;
	}
	saveFullData(){
		this.isFinalSave = true;
		this.commonService.post('plan_visu/create-orders', this.prodOrderAllData, false).subscribe({
			next: (res:any)=>{
				if(res.success){
					this._toasterSrv.showToast($localize `Order Created Successfully`,'success');
					this.isFinalSave = false;
					this.prodOrderAllData = [];
					this.prodOrderGrid!.data = []
					this.prodOrderGrid?.render();
					this.orderCustomid = ''
					this.prodOrderPosGrid!.data = []
					this.prodOrderPosGrid?.render();
					this.prodOrderPosOperationGrid!.data = []
					this.prodOrderPosOperationGrid?.render();

					if (this.onFinalSave) {
						this.onFinalSave();
					}
				}else{
					this._toasterSrv.showToast($localize `${res.details}`,'error')
					this.isFinalSave = false;
				}
				this.clearOrderDataFromStorage()
			},
			error:(err)=>{
				this._toasterSrv.showToast(err,'error')
				this.isFinalSave = false;
			}
		})
	}
	clearOrderDataFromStorage() {
		if (localStorage.getItem('orderData')) {
		  localStorage.removeItem('orderData');
		}
	}
	itemProcess(event:any){
		if(this.selectedPosRow.original.item){
			let index = this.valuEHelperGrid?.data.findIndex((item:any) => item.id == this.selectedPosRow?.original?.item?.id);
			this.valuEHelperGrid!.selectedRowsId = {[index]: true}
			this.valuEHelperGrid!.render();
		}
	}
	machineProcess(event:any){
		if(this.operationTableRowData.machine){
			let index = this.machineValuEHelperGrid?.data.findIndex((item:any) => item.id == this.operationTableRowData.machine?.id);
			this.machineValuEHelperGrid!.selectedRowsId = {[index]: true}
			this.machineValuEHelperGrid!.render();
		}
	}

	public valueHelperCustomUrlFilter: any = {
		page: 0,
		globalSearchValue: '',
		transportOrderPosCustomUrl: '',
		customUrl: '',
	};
	updateItemsWithCustomerApiUrl() {
		return `/plan_visu/get_items_with_customer?&search=${this.valueHelperCustomUrlFilter.globalSearchValue}&page=${this.valueHelperCustomUrlFilter.page}`;
	}

	onSearchItemsWithCustomer(searchValue: string) {
		this.valueHelperCustomUrlFilter.globalSearchValue = searchValue;
		this.valueHelperCustomUrlFilter.page = 1;
		this.valueHelperCustomUrlFilter.transportOrderPosCustomUrl = this.updateItemsWithCustomerApiUrl();
		if (this.valuEHelperGrid) {
			this.valuEHelperGrid.customUrl = this.valueHelperCustomUrlFilter.transportOrderPosCustomUrl;
			this.valuEHelperGrid.onPagination(true);
		}
	}

	onLoadMoreItemsWithCustomer() {
		this.valueHelperCustomUrlFilter.page += 1;

		this.valueHelperCustomUrlFilter.transportOrderPosCustomUrl = this.updateItemsWithCustomerApiUrl();

		if (this.valuEHelperGrid) {
			this.valuEHelperGrid.customUrl = this.valueHelperCustomUrlFilter.transportOrderPosCustomUrl;

			this.valuEHelperGrid.onPagination();
		}
	}

	public callOffsCustomUrlFilter: any = {
		page: 0,
		globalSearchValue: '',
		transportOrderPosCustomUrl: '',
		customUrl: '',
		start: '',
		end: '',
	};

	updateCallOffsCustomerApiUrl() {
		return `/plan_visu/get_call_offs_with_customer?&startDate=${this.callOffsCustomUrlFilter.start}&endDate=${this.callOffsCustomUrlFilter.end}&search=${this.callOffsCustomUrlFilter.globalSearchValue}&page=${this.callOffsCustomUrlFilter.page}&call_of_type=${this.callOffType}&internal_filter_type=${this.internalFilterType}`;
	}

	onChangeCallOffsDateRange(event: any) {
		const values = event.detail.value.split('-');
		const rawEnd = values.pop().trim();
		const rawStart = values.pop().trim();
		const start = moment(rawStart, 'DD/MM/YYYY').format('YYYY-MM-DD');
		const end = moment(rawEnd, 'DD/MM/YYYY').format('YYYY-MM-DD');

		this.callOffsCustomUrlFilter.page = 1;

		this.callOffsCustomUrlFilter.start = start;
		this.callOffsCustomUrlFilter.end = end;

		this.callOffsCustomUrlFilter.transportOrderPosCustomUrl = this.updateCallOffsCustomerApiUrl();

		if (this.callOffsValuEHelperGrid) {
			this.callOffsValuEHelperGrid.customUrl = this.callOffsCustomUrlFilter.transportOrderPosCustomUrl;

			this.callOffsValuEHelperGrid.onPagination(true);
		}
	}

	onSearchCallOffsCustomer(searchValue: string) {
		this.callOffsCustomUrlFilter.globalSearchValue = searchValue;

		this.callOffsCustomUrlFilter.page = 1;

		this.callOffsCustomUrlFilter.transportOrderPosCustomUrl = this.updateCallOffsCustomerApiUrl();

		if (this.callOffsValuEHelperGrid) {
			this.callOffsValuEHelperGrid.customUrl = this.callOffsCustomUrlFilter.transportOrderPosCustomUrl;

			this.callOffsValuEHelperGrid.onPagination(true);
		}
	}

	onLoadMoreCallOffsWithCustomer() {
		this.callOffsCustomUrlFilter.page += 1;

		this.callOffsCustomUrlFilter.transportOrderPosCustomUrl = this.updateCallOffsCustomerApiUrl();

		if (this.callOffsValuEHelperGrid) {
			this.callOffsValuEHelperGrid.customUrl = this.callOffsCustomUrlFilter.transportOrderPosCustomUrl;

			this.callOffsValuEHelperGrid.onPagination();
		}
	}
}
