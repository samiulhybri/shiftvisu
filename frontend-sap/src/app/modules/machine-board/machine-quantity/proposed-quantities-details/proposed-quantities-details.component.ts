import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MachineCycleType } from "../../enums/MachineCycleType";
import { CommonService } from "@app/shared/services/common.service";
import { skip } from "rxjs";
import { OrderData } from "../machine-quantity.component";

@Component({
	selector: "app-proposed-quantities-details",
	templateUrl: "./proposed-quantities-details.component.html",
	styleUrl: "./proposed-quantities-details.component.css",
})
export class ProposedQuantitiesDetailsComponent {
	@Input() machine!: number;
	@Input() operations!: OrderData[];
	@Input() type!: MachineCycleType;
	@Input() last_id!: number;
	@Output() closeEvent = new EventEmitter<void>();
	isLoading = false;
	hasMoreData = true;

	data: {
		registered_datetime: string;
		quantity: number;
		cavity: number;
		serial: string;
		batch: string;
	}[] = [];

	constructor(private commonService: CommonService) {}

	loadMore() {
		this.isLoading = true;
		this.commonService
			.post(
				`quantity/${this.machine}/get-iiot-details`,
				{
					operations: this.operations.map((op) => op.prod_order_pos_operation_id),
					type: this.type,
					last_id: this.last_id,
					skip: this.data.length,
					take: 50,
				},
				false
			)
			.subscribe((data: any) => {
				if (data.length < 50) {
					this.hasMoreData = false;
				}
				this.data = [...this.data, ...data];
				this.isLoading = false;
			});
	}
}
