import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewEncapsulation,
} from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { CommonService } from "src/app/shared/services/common.service";

import { MPConstructionTypeClass } from "src/app/enums/mp-construction-type";
import { MPExtractionTypeClass } from "src/app/enums/mp-extraction-type";
import { MPInjectionTypeClass } from "src/app/enums/mp-injection-type";
import { MPNozzleTypeClass } from "src/app/enums/mp-nozzle-type";
import { MPToolTypeClass } from "src/app/enums/mp-tool-type";
import { Customer } from "src/app/models/customer";
import { YesNoTypeClass } from "src/app/enums/yes-no-type";
import { ComboFilter } from "src/app/shared/classes/combo-filter";
import { MPOffer } from "@app/models/mp-offer";
import { MpOfferService } from "@app/modules/mp-offers/services/mp-offer.service";
@Component({
    selector: "app-root-item",
    templateUrl: "./root-item.component.html",
    styleUrls: ["./root-item.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class RootItemComponent implements OnInit, AfterViewInit {
    @Input() data?: MPOffer;
    @Input() customers!: Customer[];
    @Output() sendFormData = new EventEmitter();

    public form: any;

    public listFakeData: any = [{}];
    public toolTypeDataSource!: Array<{ value: string; text: string }>;
    public constructionTypeDataSource!: Array<{ value: string; text: string }>;
    public injectionTypeDataSource!: Array<{ value: string; text: string }>;
    public nozzleTypeDataSource!: Array<{ value: string; text: string }>;
    public extractionTypeDataSource!: Array<{ value: string; text: string }>;

    public movYesNoTypeDS!: Array<{ value: boolean; text: string }>;
    public thirdYesNoTypeDS!: Array<{ value: boolean; text: string }>;
    public dexYesNoTypeDS!: Array<{ value: boolean; text: string }>;
    public rexYesNoTypeDS!: Array<{ value: boolean; text: string }>;
    public texYesNoTypeDS!: Array<{ value: boolean; text: string }>;
    public tearexYesNoTypeDS!: Array<{ value: boolean; text: string }>;
    public lathYesNoTypeDS!: Array<{ value: boolean; text: string }>;
    public exhYesNoTypeDS!: Array<{ value: boolean; text: string }>;
    public sqxYesNoTypeDS!: Array<{ value: boolean; text: string }>;
    public hyexYesNoTypeDS!: Array<{ value: boolean; text: string }>;

    private cmbFltrCustomer: any;
    private cmbFltrToolType: any;
    private cmbFltrConstTyp: any;
    private cmbFltrInjTyp: any;
    private cmbFltrNozzleTyp: any;
    private cmbFltrExtTyp: any;
    private cmbFltrYesNo: any;
    private cmbFltrFinalCustomer: any;

    private cmbFltrYesNo_1: any;

    constructor(
        private fb: FormBuilder,
        protected _commonService: CommonService,
        private mpOfferSrv: MpOfferService
    ) {
        this.getEnumValueWithLang();
    }

    ngAfterViewInit(): void {
        this.cmbFltrCustomer = new ComboFilter(this.customers);
        this.cmbFltrFinalCustomer = new ComboFilter(this.customers);
        this.cmbFltrToolType = new ComboFilter(this.toolTypeDataSource);
        this.cmbFltrConstTyp = new ComboFilter(this.constructionTypeDataSource);
        this.cmbFltrInjTyp = new ComboFilter(this.injectionTypeDataSource);
        this.cmbFltrNozzleTyp = new ComboFilter(this.nozzleTypeDataSource);
        this.cmbFltrExtTyp = new ComboFilter(this.extractionTypeDataSource);

        this.cmbFltrYesNo = new ComboFilter(this.movYesNoTypeDS);

        this.form.valueChanges.subscribe(() => {
            this.mpOfferSrv.markAsDirty();
        });
    }

    ngOnInit(): void {
        this.loadFormElements();
        if(this.data?.is_closed) this.form.disable();
    }

    getEnumValueWithLang() {
        this.toolTypeDataSource = new MPToolTypeClass().getEnumArray();
        this.constructionTypeDataSource =
            new MPConstructionTypeClass().getEnumArray();
        this.injectionTypeDataSource =
            new MPInjectionTypeClass().getEnumArray();
        this.nozzleTypeDataSource = new MPNozzleTypeClass().getEnumArray();
        this.extractionTypeDataSource =
            new MPExtractionTypeClass().getEnumArray();

        var yes_no = new YesNoTypeClass().getEnumArray();
        this.movYesNoTypeDS = yes_no;
        this.thirdYesNoTypeDS = yes_no;
        this.dexYesNoTypeDS = yes_no;
        this.rexYesNoTypeDS = yes_no;
        this.texYesNoTypeDS = yes_no;
        this.tearexYesNoTypeDS = yes_no;
        this.lathYesNoTypeDS = yes_no;
        this.exhYesNoTypeDS = yes_no;
        this.sqxYesNoTypeDS = yes_no;
        this.hyexYesNoTypeDS = yes_no;
    }

    loadFormElements() {
        this.form = this.fb.group({
            customer_id: [null, Validators.required],
            final_customer_id: new FormControl(),
            tool_type: [null, Validators.required],
            construction_type: [null, Validators.required],
            press_weight:  new FormControl(),
            quantity_imprint: new FormControl(),
            max_length: new FormControl(),
            max_height: new FormControl(),
            max_width: new FormControl(),
            weight: new FormControl(),
            length: new FormControl(),
            height: new FormControl(),
            width: new FormControl(),
            size: new FormControl(),
            projected_area: new FormControl(),
            imprint_volume: new FormControl(),
            material: new FormControl(),
            shots_guaranteed: new FormControl(),
            finishing_visible: new FormControl(),
            finishing_not_visible: new FormControl(),
            injection_type: new FormControl(),
            nozzle_quantity: new FormControl(),
            nozzle_type: new FormControl(),
            rubber_injection: new FormControl(),
            has_movements: new FormControl(),
            movements_mechanic: new FormControl(),
            movements_hydraulic: new FormControl(),
            rods: new FormControl(),
            jowls: new FormControl(),
            unscrewing: new FormControl(),
            has_third_plate: new FormControl(),
            has_double_extraction: new FormControl(),
            extraction_type: new FormControl(),
            is_rounded_extractor: new FormControl(),
            is_tubular_extractor: new FormControl(),
            is_tear_extractor: new FormControl(),
            is_square_extractor: new FormControl(),
            is_extraction_help_fixed: new FormControl(),
            is_hydraulic_extraction_fixed: new FormControl(),
            has_laths_rings: new FormControl(),
            injection_type_2: new FormControl(),
            nozzle_quantity_2: new FormControl(),
            nozzle_type_2: new FormControl(),
            injection_note: new FormControl(),
        });
    }

    sendFormDataToParent() {
        this.sendFormData.emit(this.form);
    }

    handleFilter(value: String, src: String) {
        switch (src) {
            case "customer":
                this.customers = this.cmbFltrCustomer.handleLocalDataFilter(
                    value,
                    "name"
                );
                break;
            case "final_cust":
                this.customers =
                    this.cmbFltrFinalCustomer.handleLocalDataFilter(
                        value,
                        "name"
                    );
                break;
            case "tool_typ":
                this.toolTypeDataSource =
                    this.cmbFltrToolType.handleLocalDataFilter(value, "text");
                break;
            case "const_typ":
                this.constructionTypeDataSource =
                    this.cmbFltrConstTyp.handleLocalDataFilter(value, "text");
                break;
            case "inj_typ":
                this.injectionTypeDataSource =
                    this.cmbFltrInjTyp.handleLocalDataFilter(value, "text");
                break;
            case "nozzle_typ":
                this.nozzleTypeDataSource =
                    this.cmbFltrNozzleTyp.handleLocalDataFilter(value, "text");
                break;
            case "ext_typ":
                this.extractionTypeDataSource =
                    this.cmbFltrExtTyp.handleLocalDataFilter(value, "text");
                break;
            case "yes_no_mv":
                this.movYesNoTypeDS = this.cmbFltrYesNo.handleLocalDataFilter(
                    value,
                    "text"
                );
                break;
            case "yes_no_mv":
                this.movYesNoTypeDS = this.cmbFltrYesNo.handleLocalDataFilter(
                    value,
                    "text"
                );
                break;
            case "yes_no_trp":
                this.thirdYesNoTypeDS = this.cmbFltrYesNo.handleLocalDataFilter(
                    value,
                    "text"
                );
                break;
            case "yes_no_dex":
                this.dexYesNoTypeDS = this.cmbFltrYesNo.handleLocalDataFilter(
                    value,
                    "text"
                );
                break;
            case "yes_no_rex":
                this.rexYesNoTypeDS = this.cmbFltrYesNo.handleLocalDataFilter(
                    value,
                    "text"
                );
                break;
            case "yes_no_tex":
                this.texYesNoTypeDS = this.cmbFltrYesNo.handleLocalDataFilter(
                    value,
                    "text"
                );
                break;
            case "yes_no_tearex":
                this.tearexYesNoTypeDS = this.cmbFltrYesNo.handleLocalDataFilter(
                    value,
                    "text"
                );
                break;
            case "yes_no_lath":
                this.lathYesNoTypeDS = this.cmbFltrYesNo.handleLocalDataFilter(
                    value,
                    "text"
                );
                break;
            case "yes_no_exh":
                this.exhYesNoTypeDS = this.cmbFltrYesNo.handleLocalDataFilter(
                    value,
                    "text"
                );
                break;
            case "yes_no_sqx":
                this.sqxYesNoTypeDS = this.cmbFltrYesNo.handleLocalDataFilter(
                    value,
                    "text"
                );
                break;
            case "yes_no_hyex":
                this.hyexYesNoTypeDS = this.cmbFltrYesNo.handleLocalDataFilter(
                    value,
                    "text"
                );
                break;
        }
        //this.base_data = this.cmbFltr.handleLocalDataFilter(value,'name');
    }
}
