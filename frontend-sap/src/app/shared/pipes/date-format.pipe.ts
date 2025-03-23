import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
    transform(value: any, format: string): string {
        if (value instanceof Date) {
            const day = String(value.getDate()).padStart(2, '0');
            const month = String(value.getMonth() + 1).padStart(2, '0');
            const year = String(value.getFullYear());

            return  format.replace('dd', day).replace('MM', month).replace('yyyy', year);
        }
        return value;
    }
}
