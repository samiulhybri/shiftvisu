import { Base } from "./base";
import { Classification } from "@app/models/classification";
import {Moment} from "moment";

export class Item extends Base {
	custom_id?: number;
	is_alloy?: boolean;
	price?: number;
	price_plan?: number;
	price_plan_date?: Moment;
	stock?: number;
	hweClassificationGiesstyp?: Classification;
	hweClassificationLieferant?: Classification;
	hweClassificationBlockTyp?: Classification;
	hweClassificationWerkstoff?: Classification;

	override deserialize(input: any) {
		Object.assign(this, input);

		if (input.hweClassificationGiesstyp)
			this.hweClassificationGiesstyp = new Classification().deserialize(
				input.hweClassificationGiesstyp[0] ?? input.hweClassificationGiesstyp
			);

		if (input.hweClassificationLieferant)
			this.hweClassificationLieferant = new Classification().deserialize(
				input.hweClassificationLieferant[0] ?? input.hweClassificationLieferant
			);

		if (input.hweClassificationBlockTyp)
			this.hweClassificationBlockTyp = new Classification().deserialize(
				input.hweClassificationBlockTyp[0] ?? input.hweClassificationBlockTyp
			);

		if (input.hweClassificationWerkstoff)
			this.hweClassificationWerkstoff = new Classification().deserialize(
				input.hweClassificationWerkstoff[0] ?? input.hweClassificationWerkstoff
			);

		return this;
	}

	toOdata() {
		return {
			...this,
			hweClassificationGiesstyp: undefined,
			hweClassificationLieferant: undefined,
			hweClassificationBlockTyp: undefined,
			hweClassificationWerkstoff: undefined,
		};
	}
}
