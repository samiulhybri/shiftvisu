import { Deserializable } from "src/app/interfaces/deserializable";
import { NonDestructiveTesting } from "./non-destructive-testing";

import { SurfaceCrackTestMethod } from "@app/modules/hwe-kalk/enums/SurfaceCrackTestMethod";

export class NonDestructiveNorm implements Deserializable {
	id?: number;
	norm_type!: string;
	norm_id!: number;



	deserialize(input: any): this {
		Object.assign(this, input);
		return this;
	}

	toOdata(type: SurfaceCrackTestMethod, norm_id?:number): NonDestructiveNorm {
		return {
			...this,
			norm_id: norm_id,
			norm_type: type,
		}
	}
	

	
}
