import { Deserializable } from "../interfaces/deserializable";
import MachineUserTime from "@app/shared/models/machine-user-time.model";
import { Role } from "@app/shared/models/role.model";
import { UserGroup } from "@app/shared/models/user-group.model";
import { Machine } from "@app/shared/models/machine.model";
import { ShiftModel } from "@app/shared/models/shift-model.model";
import {  Hall } from "@app/shared/models/hall.model";

export class User implements Deserializable {
	id?: 1;
	supervisor1_user_id?: string | null = "";
	supervisor2_user_id?: string | null = "";
	name?: string | null = "";
	email?: string | null = "";
	email_verified_at?: string | null = "";
	custom_id?: string | null = "";
	chip_number?: string | null = "";
	is_active?: boolean = false;
	username?: string | null = "";
	is_melter?: boolean = false;
	is_mp_offer_user?: boolean = false;
	is_mp_offer_admin?: boolean = false;
	mp_is_allowed_reoffer?: boolean = false;
	is_supervisor?: boolean = false;
	user_type?: string | null = "";
	is_absence_manager_admin?: boolean = false;
	ip_address?: string | null = "";
	user_group?: UserGroup[] = [];
	roles: Role[] = [];
	password?:string;
	is_imported_from_erp: boolean = false;
	shiftModel?: ShiftModel;
	hall?: Hall = new Hall().deserialize({});

	userGroupString? = ""; //internal use only
	roleString? = ""; //internal use only
	isSelected?: boolean = false; //internal use only
	machineUserTime: MachineUserTime[] = [];
	machines: Machine[] = [];

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
		if (input.userGroup) {
			this.user_group = input.userGroup.map((userGr: any) =>
				new UserGroup().deserialize(userGr)
			);
			this.userGroupString = input.userGroup.map((userGr: any) => userGr.custom_id).join();
		}

		if (input.userRoles) {
			this.roles = input.userRoles.map((role: any) => new Role().deserialize(role));
			this.roleString = input.userRoles.map((role: any) => role.name).join();
		}

		if (input.shift_model) {
			this.shiftModel = new ShiftModel().deserialize(input.shift_model);
		}
		
		if (input.hall) {
			this.hall = new Hall().deserialize(input.hall);
		}

		/**
		 * without true or false two way binding does not work
		 */
		if (input.is_active == 0) {
			this.is_active = false;
		}
		if (input.is_active == 1) {
			this.is_active = true;
		}

		if (input.is_melter == 0) {
			this.is_melter = false;
		}
		if (input.is_melter == 1) {
			this.is_melter = true;
		}

		if (input.is_mp_offer_user == 0) {
			this.is_mp_offer_user = false;
		}

		if (input.is_mp_offer_user == 1) {
			this.is_mp_offer_user = true;
		}

		if (input.is_mp_offer_admin == 0) {
			this.is_mp_offer_admin = false;
		}

		if (input.is_mp_offer_admin == 1) {
			this.is_mp_offer_admin = true;
		}

		if (input.mp_is_allowed_reoffer == 0) {
			this.mp_is_allowed_reoffer = false;
		}

		if (input.mp_is_allowed_reoffer == 1) {
			this.mp_is_allowed_reoffer = true;
		}

		if (input.is_supervisor == 0) {
			this.is_supervisor = false;
		}

		if (input.is_supervisor == 1) {
			this.is_supervisor = true;
		}

		if (input.is_absence_manager_admin == 0) {
			this.is_absence_manager_admin = false;
		}
		if (input.is_absence_manager_admin == 1) {
			this.is_absence_manager_admin = true;
		}

		if (!input.chip_number) this.chip_number = "";
		if (!input.ip_address) this.ip_address = "";
		if (!input.user_type) this.user_type = "";
		if (!input.email) this.email = "";

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			isSelected : undefined,
			user_group: undefined,
			userGroupString: undefined,
			machineUserTime: undefined,
			machines: undefined,
			roles: undefined,
			is_active: this.is_active ? 1 : 0,
			is_melter: this.is_melter ? 1 : 0,
			is_mp_offer_user: this.is_mp_offer_user ? 1 : 0,
			is_mp_offer_admin: this.is_mp_offer_admin ? 1 : 0,
			mp_is_allowed_reoffer: this.mp_is_allowed_reoffer ? 1 : 0,
			is_supervisor: this.is_supervisor ? 1 : 0,
			is_absence_manager_admin: this.is_absence_manager_admin ? 1 : 0,
			shiftModel: undefined,
			shift_model_id: this.shiftModel?.id ?? null,
		};
	}

	/**
	 * only for custom api
	 */
	toJson() {
		return {
			...this,
			userGroup: this.user_group?.map(userGroup => userGroup.toOdata()),
			roles: this.roles?.map(role => role.toOdata()),
			userGroupString: undefined,
			roleString: undefined,
			machineUserTime: undefined,
			machines: undefined,
			is_active: this.is_active ? 1 : 0,
			is_melter: this.is_melter ? 1 : 0,
			is_mp_offer_user: this.is_mp_offer_user ? 1 : 0,
			is_mp_offer_admin: this.is_mp_offer_admin ? 1 : 0,
			mp_is_allowed_reoffer: this.mp_is_allowed_reoffer ? 1 : 0,
			is_supervisor: this.is_supervisor ? 1 : 0,
			is_absence_manager_admin: this.is_absence_manager_admin ? 1 : 0,
			supervisor1_user_id: parseInt(this.supervisor1_user_id!),
			supervisor2_user_id: parseInt(this.supervisor2_user_id!),
			shiftModel: undefined,
			shift_model_id: this.shiftModel?.id ?? null,
			hall_id: this.hall?.id ?? null,
			hall: undefined,
		};
	}

	// Pivot table's values
	userMachineRestrictionPayload(selectedMachines: (number | undefined)[]): Object {
		return {
			id: this.id,
			machinesIds: selectedMachines,
			isSelected: undefined,
		};
	}
}
