import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "productType",
})
export class ProductTypePipe implements PipeTransform {
	transform(value: string, isInForgePage: boolean) {
		if (!isInForgePage) {
			return value;
		}
		switch (value) {
			case "SHAFT":
				return $localize`R (Shaft)`;
			case "DISK_PUNCHED":
				return $localize`S (Disc)`;
			case "RING_CYLINDER":
				return $localize`Ring Cylinder`;
			default:
				return value;
		}
	}
}
