import { Deserializable } from "@app/shared/interfaces/deserializable";
import { User } from "@app/shared/models/user.model";

export class Area implements Deserializable {
    id?: number;
    is_active: boolean = true;
    custom_id?: string;
    name?: string = "";

    users: User[] = [];

    constructor() {}

    deserialize(input: any): this {
        Object.assign(this, input);

        if (input.users) {
            this.users = input.users.map((user: User) => new User().deserialize(user));
        }
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            users: undefined
        };
    }

    // Pivot table's values
	toJSONData(selectedUserIds: (number | undefined)[]): Object {
		return {
			id: this.id,
            user_ids: selectedUserIds,
		};
	}
}