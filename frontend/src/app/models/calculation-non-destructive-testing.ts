
import { Deserializable } from "@app/interfaces/deserializable";
import { ODatable } from "@app/interfaces/odatable";
import { CalcualtionNonDestructiveTestingAttestationEntity } from "@app/models/calculation-non-destructive-testing-attestation-entity";
import { SurfaceCrackTestMethod } from "@app/modules/hwe-kalk/enums/SurfaceCrackTestMethod";
import { PtNorm } from "@app/models/pt-norm";
import { MtNorm } from "@app/models/mt-norm";
import { VtNorm } from "@app/models/vt-norm";
import { UsNorm } from "@app/models/us-norm";
import { CalculationNonDestructiveNorm } from "@app/models/calculation-non-destructive-norm";
import { NonDestructiveTesting as NonDestructiveTestingEnum } from "@app/modules/hwe-kalk/enums/NonDestructiveTesting";
export class CalculationNonDestructiveTesting implements ODatable, Deserializable {
    id?: number;
    name: string = '';
    usNorm?: UsNorm;
    custom_id?: string;
    calculation_id?: number;
    non_destructive_testing_id?: number;
    non_destructive_testing?: NonDestructiveTestingEnum;
    ultrasound_output: string = '';
    ultrasound_test_scope: string = '';
    ultrasound_test_range: string = '';
    ultrasound_efg_max?: number;
    ultrasound_attenuation: string = '';
    ultrasound_details: string = '';
    max_residual_field_strength?: number;
    max_residual_field_strength_unit: string = '';
    surface_crack_test_method?: SurfaceCrackTestMethod;
    surface_crack_output: string = '';
    surface_crack_test_criteria: string = '';
    surface_crack_audit_scope: string = '';
    surface_crack_details: string = '';
    attestationEntities!: CalcualtionNonDestructiveTestingAttestationEntity[];
    nonDestructiveNorm?: CalculationNonDestructiveNorm;
    ptNorm?: PtNorm;
    mtNorm?: MtNorm;
    vtNorm?: VtNorm;
    offer_note:string = '';

    constructor() { }

    deserialize(input: any) {
        Object.assign(this, input);

        if (input.attestationEntities) {
            this.attestationEntities = [];
            input.attestationEntities.forEach((data: any) => {
                this.attestationEntities?.push(new CalcualtionNonDestructiveTestingAttestationEntity().deserialize(data));
            });
        }

        this.nonDestructiveNorm  = input.nonDestructiveNorm? new CalculationNonDestructiveNorm().deserialize(input.nonDestructiveNorm) : new CalculationNonDestructiveNorm().deserialize({});
        this.usNorm = input.usNorm ? new UsNorm().deserialize(input.usNorm) : new UsNorm().deserialize({});

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            us_norm_id: this.usNorm ? this.usNorm.id : null,
            attestationEntities: this.getArrData('attestation_entity', this.attestationEntities) ?? undefined,
            custom_id: undefined,
            id: undefined,
            usNorm: undefined,
            nonDestructiveNorm: undefined,
            ptNorm: undefined,
            mtNorm: undefined,
            vtNorm: undefined
        };
    }

    getArrData(key: string, arr: any) {
        let arrVal: any[] = []
        arr?.forEach((data: any) => {
            let obj: any = {}
            obj[key] = data.value;
            arrVal.push(obj)
        })
        return arrVal;
    }

    getNormId() {
        switch (this.surface_crack_test_method) {

            case SurfaceCrackTestMethod.PT:
                return this.ptNorm?.id;
            case SurfaceCrackTestMethod.VT:
                return this.vtNorm?.id;
            case SurfaceCrackTestMethod.MT:
                return this.mtNorm?.id;
            default:
                return undefined;
        }
    }
    setNorm(norm: PtNorm | VtNorm | MtNorm) {
        switch (this.surface_crack_test_method) {
            case SurfaceCrackTestMethod.PT:
                if (norm instanceof PtNorm) {
                    this.ptNorm = norm;
                }
                break;
            case SurfaceCrackTestMethod.VT:
                if (norm instanceof VtNorm) {
                    this.vtNorm = norm;
                }
                break;
            case SurfaceCrackTestMethod.MT:
                if (norm instanceof MtNorm) {
                    this.mtNorm = norm;
                }
                break;
        }
        return undefined;
    }
}

