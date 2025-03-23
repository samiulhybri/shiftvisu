import { Component } from "@angular/core";
import { Plant } from "@app/shared/models/plant.model";
import { PlantsService } from "@app/shared/services/plants.service";
import { SelectChangeEventDetail } from "@ui5/webcomponents/dist/Select";

@Component({
	selector: "app-plant-selector",
	templateUrl: "./plant-selector.component.html",
	styleUrl: "./plant-selector.component.css",
})
export class PlantSelectorComponent {
	selectedId: number | undefined;
	plants: Plant[] | undefined;

	constructor(private plantsService: PlantsService) {
		plantsService.plant.subscribe(plant => {
			this.selectedId = plant?.id;
		});
		plantsService.availablePlants.subscribe(plants => {
			this.plants = plants;
		});
	}

	onPlantChange(event: SelectChangeEventDetail) {
		this.plantsService.selectPlantById(Number(event.selectedOption.value));

		window.location.reload(); // Sync plant id to get only selected plant's data
	}
}
