import { Deserializable } from "@app/interfaces/deserializable";
import { ODatable } from "@app/interfaces/odatable";
import { HweCostCalcType } from "@app/modules/hwe-kalk/enums/HweCostCalcType";
import { HweOfferPosGroupType } from "@app/modules/hwe-kalk/enums/HweOfferPosGroupType";
import { OfferPos } from "./offer-pos";

export class OfferPosCost implements ODatable, Deserializable {
	id?: number;
	offer_pos_id?: number;
	offerPos?: OfferPos;
	quantity?: number;
	factor: number = 1;
	price?: number;
	name: string = "";
	unit?: string = "";
	_cost?: number;
	minCost?: number;
	hwe_cost_calc_type: HweCostCalcType = HweCostCalcType.PIECE;
	group_type: HweOfferPosGroupType = HweOfferPosGroupType.MANUAL;
	lead_time_days: number = 0;

	get cost(): number {
		if (this._cost === undefined) {
			this.recalculateCost();
		}
		return this._cost as number;
	}

	set cost(value: number) {
		this._cost = value;
	}

	recalculateCost() {
		this._cost = (this.price ?? 0) * this.factor * (this.quantity ?? 0);

		if (this.hwe_cost_calc_type === HweCostCalcType.POSITION) {
			this._cost /= this.offerPos?.quantity ?? 1;
		}

		this._cost = Math.max(this._cost, this.minCost ?? 0);
	}

	constructor(offerPos?: OfferPos) {
		this.offerPos = offerPos;
	}

	deserialize(input: any) {
		Object.assign(this, input);
		return this;
	}

	toOdata(): object {
		return {
			...this,
			cost: this.cost,
			_cost: undefined,
			minCost: undefined,
			offerPos: undefined,
		};
	}
}
