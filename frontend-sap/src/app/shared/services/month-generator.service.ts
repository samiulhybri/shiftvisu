import { Injectable } from '@angular/core';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class MonthGeneratorService {

  constructor() { }

  /**
     * Generates a list of ISO month strings starting from the current date.
     * @param monthsCount Number of months to generate. Default is 12.
     * @returns Array of strings in 'YYYY-MM' format.
     */
  
    getNextmonths(monthsCount: number = 12): string[] {
      const months: string[] = [];
      let currentDate = moment();

      // TODO: Need to rethink about this service. it gives this format data, even though we generate list on 16th December
      // ['2024-11', '2025-00', '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10']
  
      for (let i = 0; i < monthsCount; i++) {
        const year = currentDate.year();
        const month = currentDate.month();
        months.push(`${year}-${String(month).padStart(2, "0")}`);
        currentDate.add(1, "month");
      }
      return months;
    }

}
