import { Deserializable } from "src/app/interfaces/deserializable";
import { SurfaceCrackTestMethod } from "@app/modules/hwe-kalk/enums/SurfaceCrackTestMethod";
import { CalculationNonDestructiveTesting } from "./calculation-non-destructive-testing";
export class CalculationNonDestructiveNorm implements Deserializable {
	id?: number;
	norm_type!: string;
	norm_id!: number;
	deserialize(input: any): this {
		Object.assign(this, input);
		return this;
	}
	toOdata(type: SurfaceCrackTestMethod, norm_id?:number): CalculationNonDestructiveNorm {
		return {
			...this,
			norm_id: norm_id,
			norm_type: type,
		}
	}
	
	
}