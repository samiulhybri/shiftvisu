import { Deserializable } from "../interfaces/deserializable";
import { ODatable } from "../interfaces/odatable";
import { DocumentationCertificate } from "./documentation-certificate";
import { Marking } from "@app/modules/hwe-kalk/enums/Marking";

export class Documentation implements ODatable, Deserializable {
    id?: number;
    custom_id?: string;
    name: string = '';
    regulation: string = '';
    issue_revision: string = '';
    charge: boolean = false;
    melting_process: boolean = false;
    cleanliness_of_the_charge: boolean = false;
    cleanliness_of_the_component: boolean = false;
    grainsize_of_the_charge: boolean = false;
    grainsize_of_the_component: boolean = false;
    product_analysis: boolean = false;
    jominy: boolean = false;
    heattreamtment: boolean = false;
    heattreamtment_with_diagram: boolean = false;
    deformation: boolean = false;
    hardness_testing_hbw: boolean = false;
    hardness_testing_hbw_per_piece: boolean = false;
    conversion_acc_iso_18265_table_a_1: boolean = false;
    conversion_acc_iso_18265_table_b_2: boolean = false;
    pmi: boolean = false;
    visual_inspection: boolean = false;
    indication_of_the_surface_condition: boolean = false;
    dimension_control: boolean = false;
    dimension_protocol: boolean = false;
    residual_magnetic_field_strength: boolean = false;
    radioactivity_freedom_confirmation: boolean = false;
    confirmation_of_the_absence_of_flakes: boolean = false;
    create_forging_schedule: boolean = false;
    create_specimen_plan: boolean = false;
    create_us_test_instruction: boolean = false;
    create_mpe_test_instruction: boolean = false;
    create_fe_test_instruction: boolean = false;
    create_manufacturing_plan: boolean = false;
    create_heat_treatment_plan: boolean = false;
    test_sequence_plan: boolean = false;
    get_approval_from_the_client: boolean = false;
    initial_inspection: boolean = false;
    concentricity_check: boolean = false;
    create_furnace_position_plan: boolean = false;
    text: string = '';
    fpp_nr: string = '';
    fpp_rev: string = '';
    process_route: string = '';
    certificates!: DocumentationCertificate[];
    check_machine_feasibility: boolean = false;
    check_ik: boolean = false;
    offer_note: string = '';
    marking?: Marking;
    acceptance: boolean = false;
    constructor() { }


    deserialize(input: any) {
        Object.assign(this, input);
        this.certificates = [];
        if (input.certificates) {
            input.certificates.forEach((data: any) => {
                this.certificates?.push(new DocumentationCertificate().deserialize(data));
            });
        }
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            marking: this.marking ?? '',
            certificates: this.getArrData('certificate', this.certificates) ?? undefined
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
}

