import { SurfaceCrackTestMethod } from "@app/modules/hwe-kalk/enums/SurfaceCrackTestMethod";
import { Deserializable } from "@app/interfaces/deserializable";
import { ODatable } from "@app/interfaces/odatable";
import { NonDestructiveTestingAttestationEntity } from "@app/models/non-destructive-testing-attestation-entity";
import { UsNorm } from "@app/models/us-norm";
import { PtNorm } from "@app/models/pt-norm";
import { MtNorm } from "@app/models/mt-norm";
import { VtNorm } from "@app/models/vt-norm";
import { NonDestructiveNorm } from "@app/models/non-destructive-norm";
import {NonDestructiveTesting as NonDestructiveTestingEnum} from "@app/modules/hwe-kalk/enums/NonDestructiveTesting";
export class NonDestructiveTesting implements ODatable, Deserializable {
    id?: number;
    custom_id?: string;
    name: string = '';
    usNorm?: UsNorm;
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
    attestationEntities!: NonDestructiveTestingAttestationEntity[];
    nonDestructiveNorm?: NonDestructiveNorm;
    ptNorm!: PtNorm;
    mtNorm!: MtNorm;
    vtNorm!: VtNorm;
    offer_note:string = '';
    constructor() { }

    deserialize(input: any) {
        Object.assign(this, input);

        if (input.attestationEntities) {
            this.attestationEntities = [];
            input.attestationEntities.forEach((data: any) => {
                this.attestationEntities?.push(new NonDestructiveTestingAttestationEntity().deserialize(data));
            });
        }

        this.nonDestructiveNorm = input.nonDestructiveNorm ? new NonDestructiveNorm().deserialize(input.nonDestructiveNorm) : new NonDestructiveNorm().deserialize({});
        this.usNorm = input.usNorm ? new UsNorm().deserialize(input.usNorm) : new UsNorm().deserialize({});

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            us_norm_id: this.usNorm ? this.usNorm.id : null,
            usNorm: undefined,
            attestationEntities: this.getArrData('attestation_entity', this.attestationEntities) ?? undefined,
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

