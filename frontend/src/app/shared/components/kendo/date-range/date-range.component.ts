import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DateRange } from 'src/app/shared/types/date-range.type';

import { AdaptiveMode } from '@progress/kendo-angular-dateinputs';

/**
 * This component provides a date range picker UI that allows the user to select a start and end date range. 
 * Usage:
 * <app-date-range [animate]="true" (close)="onDateRangeSelected($event)"></app-date-range>
 * 
 * Inputs:
 *   - animate: Whether to animate the date picker popup when it opens and closes. Defaults to true.
 * 
 * Outputs:
 *   - close: An event that is emitted when the user selects a date range. The event payload is a DateRange object
 *            that contains the start and end dates of the selected range.
 */

@Component({
  selector: 'app-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss']
})
export class DateRangeComponent {
  @Input() animate: boolean = true;
  @Input() gap: number = 15;
  @Input() orientation: DateRangeOrientation = DateRangeOrientation.HORIZONTAL;
  @Input() isHidden: boolean = false;
  @Input() adaptiveMode: AdaptiveMode = "auto";
  @Input() title: string = $localize`Select Range`;
  @Input() subtitle: string = $localize`month/day/year`;

	@Output() close: EventEmitter<DateRange> = new EventEmitter<DateRange>();
	@Output() reset: EventEmitter<DateRange> = new EventEmitter<DateRange>();

  constructor() {}

  private end: Date = new Date();
  private start: Date = new Date(this.end.getFullYear(), this.end.getMonth() - 1, this.end.getDate());
  private _range: DateRange = { start: this.start, end: this.end };

  public get range(): DateRange {
    return this._range;
  }

  public set range(value: DateRange) {
    this._range = value;
  }

  // Emits DateRange type object
  public closeDatePicker(): void {
    this.close.emit(this.range);
  }

  public resetRange(): void {
    this.range = {
      start: this.start,
      end: this.end
    };
  }
}

enum DateRangeOrientation {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
}