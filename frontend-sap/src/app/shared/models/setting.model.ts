import { Deserializable } from "@app/shared/interfaces/deserializable";
import {
	StatusBoardSidebarType,
	StatusBoardSidebarTypeClass,
} from "@app/shared/enums/StatusBoardSidebarType";
import { DateToConsider, DateToConsiderClass } from "@app/shared/enums/DateToConsider";
import { EmailEncryption, EmailEncryptionClass } from "@app/shared/enums/EmailEncryption";

export class Setting implements Deserializable {
	id?: number;
	email_username?: string = "";
	email_address?: string = "";
	email_password?: string = "";
	email_port?: number;
	email_host?: string = "";
	client_name?: string = "";
	start_of_day?: string = "";
	is_ewm_enabled?: boolean = false;
	is_external_dms_enabled?: boolean = false;
	is_packaging_instruction_necessary_for_hu?: boolean = false;
	show_customer?: boolean = false;
	email_encryption = EmailEncryptionClass.getStateTranslate(EmailEncryption.SSL);
	status_board_sidebar_type = StatusBoardSidebarTypeClass.getStateTranslate(
		StatusBoardSidebarType.STANDARD_1
	);
	date_to_consider = DateToConsiderClass.getStateTranslate(DateToConsider.SHIFT_START);
	show_filter_hall?: boolean = true;
	show_filter_machine_group?: boolean = true;
	show_filter_machine?: boolean = true;
	show_filter_item?: boolean = true;
	show_filter_prod_order?: boolean = true;
	show_op_prod_order?: boolean = true;
	show_op_item?: boolean = true;
	show_op_due_date?: boolean = true;
	show_op_release_date?: boolean = true;
	show_op_constraint_type?: boolean = true;
	show_op_alt_machine?: boolean = true;
	show_op_customer?: boolean = true;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		// If the value is null it didn't set an empty string automatically. That's why added empty string if value is null
		this.email_username = input.email_username ?? "";
		this.email_address = input.email_address ?? "";
		this.email_password = input.email_password ?? "";
		this.email_host = input.email_host ?? "";
		this.client_name = input.client_name ?? "";

		this.start_of_day = input.start_of_day
			? input.start_of_day?.split(":").slice(0, 2)?.join(":")
			: "";

		if (input.date_to_consider)
			this.date_to_consider = DateToConsiderClass.getStateTranslate(input.date_to_consider) || input.date_to_consider;

		if (input.email_encryption)
			this.email_encryption = EmailEncryptionClass.getStateTranslate(input.email_encryption);

		if (input.status_board_sidebar_type)
			this.status_board_sidebar_type = StatusBoardSidebarTypeClass.getStateTranslate(
				input.status_board_sidebar_type
			) || input.status_board_sidebar_type;

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			date_to_consider: DateToConsiderClass.getStateValue(this.date_to_consider),
			email_encryption: EmailEncryptionClass.getStateValue(this.email_encryption),
			status_board_sidebar_type: StatusBoardSidebarTypeClass.getStateValue(
				this.status_board_sidebar_type
			),
		};
	}
}
