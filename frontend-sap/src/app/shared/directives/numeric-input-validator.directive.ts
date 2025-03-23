import { Directive, Input } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from "@angular/forms";

@Directive({
	selector: '[type="Number"][numeric-input-validate]',
	providers: [
		{
			provide: NG_VALIDATORS,
			useExisting: NumericInputValidatorDirective,
			multi: true,
		},
	],
})
export class NumericInputValidatorDirective implements Validator {
	@Input() min?: number;
	@Input() max?: number;
	@Input() decimalPlaces?: number;

	validate(control: AbstractControl): ValidationErrors | null {
		if (control.value == "" || !control.value) {
			return null;
		}

		if (this.min != undefined && this.min != null && Number(control.value) < Number(this.min)) {
			return {
				minError: {
					message: $localize`Plausible Lower Limit Exceeded`,
					expected: this.min,
					value: control.value,
				},
			};
		}

		if (this.max != undefined && this.max != null && Number(control.value) > Number(this.max)) {
			return {
				maxError: {
					message: $localize`Plausible Upper Limit Exceeded`,
					expected: this.max,
					value: control.value,
				},
			};
		}

		if (
			this.decimalPlaces != undefined &&
			this.decimalPlaces != null &&
			this.decimalPlaces >= 0
		) {
			const decimalCheckRegex = new RegExp(`^[-]?\\d+(\\.\\d{0,${this.decimalPlaces}})?$`);
			const valid = decimalCheckRegex.test(control.value);

			if (!valid) {
				return {
					decimalError: {
						message: $localize`Decimal Limit Exceeded`,
						expected: this.decimalPlaces,
						value: control.value,
					},
				};
			}
		}

		return null;
	}
}
