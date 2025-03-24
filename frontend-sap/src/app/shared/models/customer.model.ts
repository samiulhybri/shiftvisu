import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Chat } from "@app/shared/models/chat.model";
import { Country } from "@app/shared/models/country.model";
import { CustomerGroup } from "@app/shared/models/customer-group.model";
import { DeliveryTerm } from "@app/shared/models/delivery-term.model";
import { PaymentTerm } from "@app/shared/models/payment-term.model";
import { SalesArea } from "@app/shared/models/sales-area.model";
import { SalesGroup } from "@app/shared/models/sales-group.model";
import { SalesStatus } from "@app/shared/models/sales-status.model";
import { Sector } from "@app/shared/models/sector.model";
import { User } from "@app/shared/models/user.model";
import { RevenueClassification } from "@app/shared/models/revenue-classification.model";
import { MachineClassification } from "@app/shared/models/machine-classification.model";
import { EmployeeClassification } from "@app/shared/models/employee-classification.model";
import { PotentialClassification } from "@app/shared/models/potential-classification.model";
import { MarketSegment } from "@app/shared/models/market-segment.model";
import { Contactable } from "@app/shared/models/contactable.model";
import { CustomerCategory } from "@app/shared/models/customer-category.model";
import moment from "moment";

export class Customer implements Deserializable {
	id?: number;
	custom_id?: string = "";
	name?: string = "";
	email?: string = "";
	website?: string = "";
	date_follow_up?: string = "";
	customerGroup?: CustomerGroup;
	is_active?: boolean = true;
	name2?: string = "";
	address?: string = "";
	region?: string = "";
	crm_id?: string = "";
	postal_code?: string = "";
	country?: Country;
	city?: string = "";
	telephone?: string = "";
	vat?: string = "";
	external_id?: string = "";
	source?: string = "";
	date_sourced?: string = "";
	note?: string = "";
	total_insured?: number = 0;
	total_production?: number = 0;
	total_outstanding?: number = 0;
	total_revenue?: number = 0;
	progress?: number = 0;
	deliveryTerm?: DeliveryTerm;
	paymentTerm?: PaymentTerm;
	salesArea?: SalesArea;
	salesGroup?: SalesGroup;
	sector?: Sector;
	chat?: Chat;
	responsibleUser?: User;
	salesStatus?: SalesStatus;
	revenueClassification?: RevenueClassification;
	machineClassification?: MachineClassification;
	employeeClassification?: EmployeeClassification;
	potentialClassification?: PotentialClassification;
	marketSegment?: MarketSegment;
	contactable?: Contactable[] = [];
	is_imported_from_erp: boolean = false;
	category?: CustomerCategory;
	created_at?:Date;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
		this.is_active = !input.hasOwnProperty("is_active") ? true : input.is_active ? true : false;

		this.progress = (input.progress || 0) * 100;
		if (input.customerGroup)
			this.customerGroup = new CustomerGroup().deserialize(input.customerGroup);
		if (input.country) this.country = new Country().deserialize(input.country);
		if (input.deliveryTerm)
			this.deliveryTerm = new DeliveryTerm().deserialize(input.deliveryTerm);
		if (input.paymentTerm) this.paymentTerm = new PaymentTerm().deserialize(input.paymentTerm);
		if (input.salesArea) this.salesArea = new SalesArea().deserialize(input.salesArea);
		if (input.salesGroup) this.salesGroup = new SalesGroup().deserialize(input.salesGroup);
		if (input.sector) this.sector = new Sector().deserialize(input.sector);

		this.chat = new Chat().deserialize(input.chat ? input.chat : input.chat_id ? {id: input.chat_id} : {});
		
		if (input.responsibleUser) this.responsibleUser = new User().deserialize(input.responsibleUser);
		if (input.salesStatus) this.salesStatus = new SalesStatus().deserialize(input.salesStatus);
		if (input.revenueClassification)
			this.revenueClassification = new RevenueClassification().deserialize(
				input.revenueClassification
			);
		if (input.machineClassification)
			this.machineClassification = new MachineClassification().deserialize(
				input.machineClassification
			);
		if (input.employeeClassification)
			this.employeeClassification = new EmployeeClassification().deserialize(
				input.employeeClassification
			);
		if (input.potentialClassification)
			this.potentialClassification = new PotentialClassification().deserialize(
				input.potentialClassification
			);
		if (input.marketSegment)
			this.marketSegment = new MarketSegment().deserialize(input.marketSegment);

		if (input.category)
			this.category = new CustomerCategory().deserialize(input.category);
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			date_follow_up: this.date_follow_up ? this.date_follow_up : null,
			country_id: this.country?.id,
			delivery_term_id: this.deliveryTerm?.id,
			payment_term_id: this.paymentTerm?.id,
			sales_area_id: this.salesArea?.id,
			sales_group_id: this.salesGroup?.id,
			customer_group_id: this.customerGroup?.id,
			sector_id: this.sector?.id,
			chat_id: this.chat?.id,
			user_id_responsible: this.responsibleUser?.id,
			sales_status_id: this.salesStatus?.id,
			revenue_classification_id: this.revenueClassification?.id,
			machine_classification_id: this.machineClassification?.id,
			employee_classification_id: this.employeeClassification?.id,
			potential_classification_id: this.potentialClassification?.id,
			market_segment_id: this.marketSegment?.id,
			progress: (this.progress || 0) / 100,
			customer_category_id: this.category?.id,
			category: undefined,
			country: undefined,
			deliveryTerm: undefined,
			paymentTerm: undefined,
			salesArea: undefined,
			salesGroup: undefined,
			customerGroup: undefined,
			sector: undefined,
			chat: undefined,
			responsibleUser: undefined,
			salesStatus: undefined,
			revenueClassification: undefined,
			machineClassification: undefined,
			employeeClassification: undefined,
			potentialClassification: undefined,
			contactable: undefined,
			customerMarketSegments: undefined,
			marketSegment: undefined,
			media: undefined,
		};
	}
}
