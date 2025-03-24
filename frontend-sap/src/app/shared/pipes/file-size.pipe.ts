import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {
    transform(value: number): string {
        const KB = 1024;
        const MB = KB * 1024;

        if (value >= MB) return (value / MB).toFixed(2) + ' MB';
        else return (value / KB).toFixed(2) + ' KB';
    }
}