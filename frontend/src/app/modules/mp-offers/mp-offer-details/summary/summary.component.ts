import {
    AfterViewInit,
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { RowClassArgs } from "@progress/kendo-angular-grid";
import { IntlService } from "@progress/kendo-angular-intl";
import { MPCostGroup } from "src/app/enums/mp-cost-group";
import { YesNoTypeClass } from "src/app/enums/yes-no-type";
import { MPOffer } from "src/app/models/mp-offer";
import { ComboFilter } from "src/app/shared/classes/combo-filter";
import { MpOfferService } from "../../services/mp-offer.service";
import { AuthService } from "@app/services/auth.service";

@Component({
    selector: "app-summary",
    templateUrl: "./summary.component.html",
    styleUrls: ["./summary.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class SummaryComponent implements OnInit, AfterViewInit {
    @Input() data?: MPOffer;
    @Input() pos_data: any;

    costGroup = MPCostGroup;

    public summaryData: any = [{}];
    public form: any;
    public yesNoTypeDS!: Array<{ value: boolean; text: string }>;
    public cmbFltr: any;

    private selectedField: string = '';
    private fieldValue: number = 0.00;

    public currentAuthUser: any = [];

    constructor(public intl: IntlService,
        private mpOfferSrv: MpOfferService,
        protected authService: AuthService) {
    }

    ngOnInit() {
        this.currentAuthUser = this.authService.user ?? {};

        this.form = new FormGroup({
            total_material: new FormControl(),
            surplus_material: new FormControl(),
            total_external: new FormControl(),
            surplus_external: new FormControl(),
            total_internal: new FormControl(),
            surplus_internal: new FormControl(),
            surplus_total: new FormControl(),
            total: new FormControl(),
            total_surplus: new FormControl(),
            total_sales: new FormControl(),
            total_margin: new FormControl(),
            total_margin_per: new FormControl(),
            total_sales_margin: new FormControl(),
            is_closed: new FormControl(),
            total_hours: new FormControl(),
            surplus_internal_personnel: new FormControl(),
            surplus_internal_machine: new FormControl()
        });

        if (this.data?.is_closed) {
            this.form.disable();
            if(this.currentAuthUser && this.currentAuthUser.mp_is_allowed_reoffer) 
                this.form.controls.is_closed.enable();
        }
    }

    ngAfterViewInit(): void {
        this.yesNoTypeDS = new YesNoTypeClass().getEnumArray();
        this.cmbFltr = new ComboFilter(this.yesNoTypeDS);

        this.form.valueChanges.subscribe(() => {
            this.mpOfferSrv.markAsDirty();
        });
    }
    
    getBackgroundLogicColor(value: number) {
        if (isNaN(value)) return { "background-color": "#121D2C" };   // BLACK
        else if (value < 8) return { "background-color": "#F04438" };  // RED
        else if (value >= 8 && value < 16.64) return { "background-color": "#FADA0A" };  // YELLOW
        else if (value >= 16.64) return { "background-color": "#12B76A" };  // GREEN
        else return { "background-color": "gainsboro" };   // GREY
    }

    handleFilter(value: String) {
        this.yesNoTypeDS = this.cmbFltr.handleLocalDataFilter(value, "text");
    }

    public rowCallback = (context: RowClassArgs) => {
        console.log(context);
    };

    public onChange(event: any, type: string) {
        this.selectedField = type;
        this.fieldValue = event;
    }

    public onBlur() {
        switch(this.selectedField) {
            case 'material':
                this.data!.surplus_material = this.fieldValue;
                break;
            case 'external':
                this.data!.surplus_external = this.fieldValue;
                break;
            case 'internal':
                // this.data!.surplus_internal = this.fieldValue;
                this.data!.surplus_internal = this.data!.getInternalSurplus();
                break;
            case 'total':
                this.data!.surplus_total = this.fieldValue;
                break;
            case 'internal_personnel': 
                this.data!.surplus_internal_personnel = this.fieldValue;
                this.data!.surplus_internal = this.data!.getInternalSurplus();
                break;
            case 'internal_machine':
                this.data!.surplus_internal_machine = this.fieldValue;
                this.data!.surplus_internal = this.data!.getInternalSurplus();
                break;
            default:
                break;
        }
    }
}
