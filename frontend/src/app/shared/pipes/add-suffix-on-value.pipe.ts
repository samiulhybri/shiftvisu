import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addSuffixOnValue'
})
export class AddSuffixOnValuePipe implements PipeTransform {

  transform(value: string | number, suffix: string): unknown {

    if(value == null || value == undefined || value === '') {
      return value;
    }
    else {
      return value + ' ' + suffix;
    }
  }

}
