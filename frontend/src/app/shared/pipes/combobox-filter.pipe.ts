import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'comboboxFilter'
})
export class ComboboxFilterPipe implements PipeTransform {

	transform(comboData: [], searchValue?: string) {
		if (!comboData || !searchValue) {
			return comboData;
		}
		searchValue = searchValue.toLowerCase()
		return comboData.filter((item: any) => {
			for (let key in item) {
				if (item[key] && typeof item[key] === 'string' && item[key].toLowerCase().includes(searchValue)) {
					return true;
				}
			}
			return false;
		});
	}
}
