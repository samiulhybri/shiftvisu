import { Pipe, PipeTransform } from "@angular/core";
import { ItemStateType } from "../enums/ItemStateType";

@Pipe({
	name: "filterSelectionPartReasons",
})
export class FilterSelectionPartReasonsPipe implements PipeTransform {
	transform(itemStates: any[], itemStateType: ItemStateType): any[] {
		// Check if itemStates or itemStateType are not provided
		if (!itemStates || !itemStateType) {
			return itemStates; // Return the original array if the filter criteria are not provided
		}
		// Filter the array based on the provided itemStateType
		return itemStates.filter(reason => reason.item_state_type === itemStateType);
	}
}
