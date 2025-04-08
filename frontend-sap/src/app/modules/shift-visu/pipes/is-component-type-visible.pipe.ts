import { Pipe, PipeTransform } from "@angular/core";

import { ShiftVisuComponentTypeEnum } from "@app/shared/enums/ShiftVisuComponentTypeEnum";

@Pipe({
	name: "isComponentTypeVisible",
})
export class IsComponentTypeVisiblePipe implements PipeTransform {
	transform(value: string | null = null, model_type: any): unknown {
		if (model_type == "" || model_type == null || model_type == undefined ) {
			return true;
		}

		if (
			value == ShiftVisuComponentTypeEnum.DROPDOWN_SINGLE ||
			value == ShiftVisuComponentTypeEnum.DROPDOWN_MULTI
		) {
			return true;
		}

		return false;
	}
}
