import { Deserializable } from "@app/shared/interfaces/deserializable";
import { OperationControlProfileConfirmationTypeClass } from "@app/shared/enums/operation_control_profile_confirmation_type.enum";
import { OperationControlProfileExternalProcessingTypeClass } from "@app/shared/enums/operation_control_profile_external_processing_type.enum";

export default class OperationControlProfile implements Deserializable {
	id?: number;
	custom_id?: string = "";
	is_active?: boolean = true;
	auto_post_goods_receipt?: boolean = false;
	created_at?: string;
	updated_at?: string;
	confirmation_type: string = "";
	external_processing_type: string = "";
	isSelected?: boolean = false; //for internal use

	deserialize(input: any): this {
		Object.assign(this, input);
		this.confirmation_type = input.confirmation_type ?? "";
		this.external_processing_type = input.external_processing_type ?? "";
		
		if (input.confirmation_type) {
			this.confirmation_type = OperationControlProfileConfirmationTypeClass.getStateTranslate(input.confirmation_type);
		}	
		if (input.external_processing_type) {
			this.external_processing_type = OperationControlProfileExternalProcessingTypeClass.getStateTranslate(input.external_processing_type);
		}
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			confirmation_type: OperationControlProfileConfirmationTypeClass.getStateValue(this.confirmation_type),
			external_processing_type: OperationControlProfileExternalProcessingTypeClass.getStateValue(this.external_processing_type),
			isSelected: undefined,
		};
	}
}
