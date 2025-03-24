import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: "hexToRgbaByOpacity",
})
export class HexToRgbaByOpacityPipe implements PipeTransform {
	transform(value: string|undefined|null): string {
    if(!value) {
      return '';
    }
		let bigint = parseInt(value, 16);
		let r = (bigint >> 16) & 255;
		let g = (bigint >> 8) & 255;
		let b = bigint & 255;

		return `rgba(${r},${g},${b},0.5)`;
	}
}
