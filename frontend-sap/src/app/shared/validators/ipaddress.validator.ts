import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function ipv4Validator(): ValidatorFn {
	const ipv4Pattern =
		/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	return (control: AbstractControl): ValidationErrors | null => {
		const value = control.value;
		const isValid = ipv4Pattern.test(value);
		return isValid ? null : { ipv4: true };
	};
}
