import { Injectable } from "@angular/core";
import { CommonService } from "./common.service";
import { BehaviorSubject, map, Observable } from "rxjs";
import { Plant } from "../models/plant.model";

@Injectable({
	providedIn: "root",
})
export class PlantsService {
	/**
	 * The selected plant id. There is no guarantee that the plant with this id exists.
	 */
	public readonly plantId: BehaviorSubject<number | undefined>;
	/**
	 * The selected plant. This plant is guaranteed to exist, but use plantId if possible.
	 */
	public readonly plant: BehaviorSubject<Plant | undefined>;
	public readonly availablePlants: BehaviorSubject<Plant[] | undefined>;

	constructor(private commonService: CommonService) {
		this.plant = new BehaviorSubject<Plant | undefined>(undefined);
		this.availablePlants = new BehaviorSubject<Plant[] | undefined>(undefined);
		this.plantId = new BehaviorSubject<number | undefined>(this.loadPlantIdFromLocalStorage());

		this.refreshPlants();
		this.plant.subscribe(plant => {
			if (plant) {
				this.storePlantIdToLocalStorage(plant.id?.toString() || "");
			}
		});
	}

	selectPlantById(id: number) {
		const plant = this.availablePlants.value?.find(plant => plant.id === id);
		if (plant) {
			this.plant.next(plant);
		}
	}

	refreshPlants() {
		this.commonService
			.get("Plants?&filter=is_active eq true")
			.pipe(
				map((data: any) =>
					(data.value as any[]).map((plant: any) => new Plant().deserialize(plant))
				)
			)
			.subscribe((plants: Plant[]) => {
				this.availablePlants.next(plants);
				const selectedPlant = plants.find(plant => plant.id === this.plantId.value);
				if (selectedPlant) {
					this.plant.next(selectedPlant);
				} else {
					this.plant.next(plants[0]);
					this.plantId.next(plants[0].id);
				}
			});
	}

	private loadPlantIdFromLocalStorage(): number | undefined {
		return localStorage.getItem("selected_plant_id")
			? Number(localStorage.getItem("selected_plant_id"))
			: undefined;
	}

	private storePlantIdToLocalStorage(plantId: string) {
		localStorage.setItem("selected_plant_id", plantId);
	}
}
