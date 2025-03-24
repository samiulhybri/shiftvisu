import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateFormGroupArgs, EditMode, SchedulerEvent } from "@progress/kendo-angular-scheduler";
import { Subscription } from 'rxjs';
import { Base } from 'src/app/shared/classes/base';
import { CommonService } from 'src/app/shared/services/common.service';
import { IntlService } from "@progress/kendo-angular-intl";

@Component({
	selector: 'app-sequence-planning',
	templateUrl: './sequence-planning.component.html',
	styleUrls: ['./sequence-planning.component.scss']
})
export class SequencePlanningComponent extends Base {

	public isLoading: boolean = false;
	public prodOrderSubscription!: Subscription;
	public machineSubscription!: Subscription;
	public prodOrder: any[] = [];
	public machines: any[] = [];
	public schedulerData: any[] = [];
	public resources: any[] = [];

	public formGroup!: FormGroup;
	
	constructor(
			private _commonService: CommonService,
			private formBuilder: FormBuilder,
			private cdRef: ChangeDetectorRef, intlService: IntlService
		) {

		super(intlService);
		this.createFormGroup = this.createFormGroup.bind(this);
	}

	getHallData(dataItem: any) {
		this.getMachines(dataItem.id);
	}

	getProdOrder(machineIds: Array<any>) {
		this.isLoading = true;
		this.prodOrderSubscription = this._commonService.get(`ProdOrderPosOperations?$expand=prodOrderPos($expand=prodOrder,item)&$filter=machine_id in (${machineIds.join(",")})`)
			.subscribe(
				(res: any) => {
					this.isLoading = false
					this.prodOrder = res.value
					this.prepareSchedulerData(this.prodOrder)
				})
	}

	getMachines(hallId: number) {
		this.isLoading = true;
		this.cdRef.detectChanges();
		this.machineSubscription = this._commonService.get(`Machines?$filter=hall_id eq ${hallId}`)
			.subscribe((res: any) => {
				this.isLoading = false;
				this.machines = res.value;
				let machineIds: any[] = [];
				this.machines.map((machine) => {
					machineIds.push(machine.id)
				})
				
				this.getProdOrder(machineIds)
			})
	}

	prepareSchedulerData(prodOrder: Array<any>) {
		let operations: any[] = [];
		let orders:any[] = [];
		prodOrder.map((operation) => {
			let operationFound = operations.find(i => i.value == operation.pos)
			if (!operationFound) {
				operations.push({
					name: operation.name,
					value: operation.pos
				})
			}

			let order = {
				operationId: operation.id,
				prodOrderId: operation.prodOrderPos.prod_order_id,
				prodOrderCustomId: operation.prodOrderPos.prodOrder.custom_id,
				prodOrderPosId: operation.prod_order_pos_id,
				cavity: operation.cavity,
				machineId: operation.machine_id,
				operationStartDateTime: operation.start,
				operationEndDateTime: operation.end,
				te: operation.te,
				tr: operation.tr,
				quantity: operation.prodOrderPos.quantity,
				registeredQuantity: operation.registered_quantity,
				itemId: operation.prodOrderPos.item_id,
				toolId: operation.tool_id,
				posID: operation.pos
			}

			orders.push(order)
		})

		this.schedulerData = orders.map(
			(dataItem) =>
				<SchedulerEvent>{
					id: dataItem.operationId,
					start: new Date(dataItem.operationStartDateTime),
					end: new Date(dataItem.operationEndDateTime),
					isAllDay: false,
					title: dataItem.prodOrderCustomId,
					machineId: dataItem.machineId,
					posID: dataItem.posID,
				}
		);

		this.resources = [
			{
				name: "Machines",
				data: this.machines,
				field: "machineId",
				valueField: "id",
				textField: "name",
			},
			{
				name: "Operations",
				data: operations,
				field: "posID",
				valueField: "value",
				textField: "name",
			}
		]
	}

	schedulerConfig = {
		views: [
			'timeline-week-view',
			'timeline-month-view',
		]
	}

	slotDuration =  720;

	selectedDate: Date = new Date(2022, 10, 23);

	group: any = {
		resources: ["Machines", "Operations"],
		orientation: "vertical",
	};

	public createFormGroup(args: CreateFormGroupArgs): FormGroup {
		const dataItem = args.dataItem;
		this.formGroup = this.formBuilder.group({
		  id: args.isNew ? this.getNextId() : dataItem.id,
		  start: [dataItem.start, Validators.required],
		  end: [dataItem.end, Validators.required],
		  isAllDay: dataItem.isAllDay,
		  title: dataItem.title,
		});
	
		return this.formGroup;
	}
	
	public isEditingSeries(editMode: EditMode): boolean {
		return editMode === EditMode.Series;
	}

	public getNextId(): number {
		const len = this.schedulerData.length;
		return len === 0 ? 1 : this.schedulerData[this.schedulerData.length - 1].id + 1;
	}

	ngOnDestroy() {
		if (this.prodOrderSubscription) this.prodOrderSubscription.unsubscribe();
		if (this.machineSubscription) this.machineSubscription.unsubscribe();
	}
}
