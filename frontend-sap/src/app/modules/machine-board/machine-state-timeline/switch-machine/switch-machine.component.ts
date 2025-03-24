import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Machine } from "@app/shared/models/machine.model";
import { CommonService } from "@app/shared/services/common.service";
import { PlantsService } from "@app/shared/services/plants.service";

@Component({
	selector: "app-switch-machine",
	templateUrl: "./switch-machine.component.html",
	styleUrl: "./switch-machine.component.css",
})
export class SwitchMachineComponent {
	machines: Machine[] = [];
	isBusy = false;
	@Input() isDialogOpen = false;
	@Output() close: EventEmitter<void> = new EventEmitter();

	constructor(private commonService: CommonService, private router: Router, private route: ActivatedRoute, private plantService: PlantsService) {}

	ngOnInit(): void {
		this.setUpMachines();
	}

	setUpMachines() {
		this.isBusy = true;
		this.machines = [];
		this.commonService.get(`machines/${this.plantService.plantId.value}`, false).subscribe({
			next: (data: any) => {
				this.machines = data.map((machine: Machine) => {
					return new Machine().deserialize(machine);
				});

        this.machines = this.machines.filter(machine => machine.id != (this.route.snapshot.params as any)['id']);
				this.isBusy = false;
			},
		});
	}

	closeDialog() {
		this.close.emit();
	}

	selectMachine(event: any) {
		const id = event.detail.targetItem.id;
		this.router.navigate(["machine-board", `${id}`]).then(() => {
			window.location.reload();
		});
		this.close.emit();
	}
}
