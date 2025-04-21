import {Deserializable} from "../interfaces/deserializable";
import {InspectionPoint} from "@app/shared/models/inspection-point.model";
import {
    ProdInspectionOperationFrequencyEnum
} from "@app/modules/quali-visu/enums/prod-inspection-operation-frequency-enum";
import {ProdInspectionOperationResource} from "@app/shared/models/prod-inspection-operation-resource.model";
import {InspectionOperationChateristic} from "@app/shared/models/inspection-operation-characteristic.model";

export class ProdInspectionOperation implements Deserializable {
    id?: number;
    is_open?: boolean;
    pos?: string;
    frequency?: ProdInspectionOperationFrequencyEnum;
    name?: string;
    inspectionPoints: InspectionPoint[] = [];
    prodInspectionOperationResources: ProdInspectionOperationResource[] = [];
    inspectionOperationCharacteristics: InspectionOperationChateristic[] = [];

    constructor() {
    }

    deserialize(input: any): this {
        Object.assign(this, input);
        if (input.inspectionPoints || input.inspection_points) {
            this.inspectionPoints = (input.inspectionPoints ?? input.inspection_points).map(
                (inspectionPoint: any) => new InspectionPoint().deserialize(inspectionPoint)
            );
        }
        if (input.prodInspectionOperationResources || input.prod_inspection_operation_resources) {
            this.prodInspectionOperationResources = (input.prodInspectionOperationResources ?? input.prod_inspection_operation_resources).map(
                (prodInspectionOperationResource: any) => new ProdInspectionOperationResource().deserialize(prodInspectionOperationResource)
            );
        }
        if (input.inspectionOperationCharacteristics || input.inspection_operation_characteristics) {
            this.inspectionOperationCharacteristics = (input.inspectionOperationCharacteristics ?? input.inspection_operation_characteristics).map(
                (inspectionOperationCharacteristic: any) => new InspectionOperationChateristic().deserialize(inspectionOperationCharacteristic)
            );
        }
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            inspectionPoints: undefined,
            inspection_points: undefined,
            prodInspectionOperationResources: undefined,
            prod_inspection_operation_resources: undefined,
            inspectionOperationCharacteristics: undefined,
            inspection_operation_characteristics: undefined,
        };
    }

    hasOpenInspectionPoints(): boolean {
        return this.is_open ?? this.numberOfOpenInspectionPoints() > 0;
    }

    numberOfOpenInspectionPoints(): number {
        return this.inspectionPoints.reduce((counter, inspectionPoint) => counter + (inspectionPoint.isOpen() ? 1 : 0), 0)
    }
}
