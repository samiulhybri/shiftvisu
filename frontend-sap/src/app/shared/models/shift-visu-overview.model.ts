import { Deserializable } from "@app/shared/interfaces/deserializable";
import { ShiftVisuComponentTypeEnum } from "@app/shared/enums/ShiftVisuComponentTypeEnum";
import { ShiftVisuComponentOptionModel } from "@app/shared/models/shift-visu-component-option.model";
import { Hall } from "./hall.model";
import { User } from "./user.model";
import { ShiftVisuIssueTypeModel } from "./shift-visu-issue-type.model"; // Ensure this is a class or value
import { Chat } from "./chat.model";

export class ShiftVisuOverview implements Deserializable {
	id?: number;
	hall_id?: number;
	creator_id?: number;
	error_id?: number;
	error_type?: string;
	description?: string;
	hall: Hall = new Hall().deserialize({});
	creator: User = new User().deserialize({});
	componentOptions?: ShiftVisuComponentOptionModel =
		new ShiftVisuComponentOptionModel().deserialize({});
	error?: any;
	chat?: Chat;
	created_at?: string;
	updated_at?: string;

	deserialize(input: any) {
		Object.assign(this, input);
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			updated_at: undefined,
		};
	}
}
