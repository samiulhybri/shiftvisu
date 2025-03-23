import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogComponent } from "@app/shared/components/dialog/dialog.component";
import { Classification } from "@app/shared/models/classification.model";
import { Hall } from "@app/shared/models/hall.model";
import { MachineGroup } from "@app/shared/models/machine-group.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { Localization } from "@app/shared/utils/common-localize";
import moment from "moment";

@Component({
	selector: "app-operation",
	templateUrl: "./operation.component.html",
	styleUrl: "./operation.component.css",
})
export class OperationComponent {
	public openCalDetails: boolean = false;
	public calculationId!: number;
	protected prodOrderPosOperation: ProdOrderPosOperation = new ProdOrderPosOperation();
	protected momentInstance = moment;
	localization = Localization;

	@ViewChild("operationDialog") dialog?: DialogComponent;

	constructor(
		private route: ActivatedRoute,
		private router: Router
	) {}
	ngOnInit(): void {
		if (!history.state?.hall && !history.state?.operation) {
			this.router.navigate(["../../"], { relativeTo: this.route });
			return;
		}

		const operationId = this.route.snapshot.params["id"];

		if (history.state?.operation) {
			this.prodOrderPosOperation.deserialize(JSON.parse(history.state?.operation));
		} else {
			const hall = new Hall().deserialize(JSON.parse(history.state?.hall));
			hall.machineGroup.forEach((machineGroup: MachineGroup) => {
				machineGroup.prodOrderPosOperations.forEach(
					(prodOrderPosOperation: ProdOrderPosOperation) => {
						if (operationId == prodOrderPosOperation.id) {
							this.prodOrderPosOperation.deserialize(prodOrderPosOperation);
						}
					}
				);
			});
		}
	}

	handleClose() {
		this.dialog?.closeDialog();
	}
	calculationDetails(calculationId?: number) {
		this.openCalDetails = true;
		if (calculationId) this.calculationId = calculationId;
	}
	closeHweDialog(isOff: boolean) {
		this.openCalDetails = false;
	}

	getMelt(classifications: Classification[]) {
		const attribute = classifications.find(
			item => item.attribute == "Z_SCHMELZE"
		)?.value_string;
		return attribute;
	}

	getBlockNumber(classifications: Classification[]) {
		const attribute = classifications.find(
			item => item.attribute == "Z_BLOCKIDENT"
		)?.value_string;
		return attribute;
	}
	getDimension1(classifications: Classification[]) {
		const attribute = classifications.find(
			item => item.attribute == "ISTABMESSUNG1"
		)?.value_string;
		return attribute;
	}
	getDimension2(classifications: Classification[]) {
		const attribute = classifications.find(
			item => item.attribute == "ISTABMESSUNG2"
		)?.value_string;
		return attribute;
	}
	getBlockFormat(classifications: Classification[]) {
		const attribute = classifications.find(
			item => item.attribute == "BLOCKGEOMETRIE"
		)?.value_string;
		return attribute;
	}
	getLong(classifications: Classification[]) {
		const attribute = classifications.find(
			item => item.attribute == "Z_RESERV_LAENGE"
		)?.value_string;
		return attribute;
	}
	getOperationalWeight(classifications: Classification[]) {
		const attribute = classifications.find(
			item => item.attribute == "Z_GEW_EINGABE"
		)?.value_string;
		return attribute;
	}
}
