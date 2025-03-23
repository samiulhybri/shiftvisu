import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function portValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const portNumber = Number(control.value);
		const isValid = Number.isInteger(portNumber) && portNumber > 0 && portNumber <= 65535;
		return  isValid? null: {
					invalidPort: true,
				};
	};
}
