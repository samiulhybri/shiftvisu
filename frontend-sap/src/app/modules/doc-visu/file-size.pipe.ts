import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {
  transform(size: number): string {
    if (!size || size <= 0) {
      return '0 KB';
    }

    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let index = 0;

    while (size >= 1024 && index < units.length - 1) {
      size = size / 1024;
      index++;
    }

    return `${size.toFixed(2)} ${units[index]}`;
  }
}
