import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderByKey'
})
export class OrderByKeyPipe implements PipeTransform {

  transform(data: any[], field: any): unknown {
    data.sort((a: any, b: any) => {
      if (Number(a[field]) < Number(b[field])) {
        return -1;
      } else if (Number(a[field]) > Number(b[field])) {
        return 1;
      } else {
        return 0;
      }
    });
    return data;

  }

}
