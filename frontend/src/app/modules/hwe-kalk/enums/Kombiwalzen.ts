export enum Kombiwalzen {
	KEIN_KOMBIWALZEN = 0,
	HWE_STECHEN = 1,
	LOHNSÄGEN = 2,
	HWE_SÄGEN = 3,
}

export class KombiwalzenClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case Kombiwalzen.KEIN_KOMBIWALZEN:
				return $localize`Kein Kombiwalzen`;
			case Kombiwalzen.HWE_STECHEN:
				return $localize`HWE-Stechen`;
			case Kombiwalzen.LOHNSÄGEN:
				return $localize`Lohnsägen`;
			case Kombiwalzen.HWE_SÄGEN:
				return $localize`HWE-Sägen`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): number {
		switch (value) {
			case $localize`KEIN_KOMBIWALZEN`:
				return Kombiwalzen.KEIN_KOMBIWALZEN;
			case $localize`HWE-Stechen`:
				return Kombiwalzen.HWE_STECHEN;
			case $localize`Lohnsägen`:
				return Kombiwalzen.LOHNSÄGEN;
			case $localize`HWE-Sägen`:
				return Kombiwalzen.HWE_SÄGEN;
			default:
				return 0;
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(Kombiwalzen);
		elements.forEach(elm => {
			const value = Number(elm);
			if (Number(value) > -1) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(value) });
			}
		});

		return enum_arr;
	}
}
