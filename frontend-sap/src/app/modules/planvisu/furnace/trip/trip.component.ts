import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ProdLot } from '@app/shared/models/prod-lot.model';
import { Localization } from '@app/shared/utils/common-localize';

@Component({
  selector: 'app-trip',
  templateUrl: './trip.component.html',
  styleUrl: './trip.component.css'
})
export class TripComponent {
  @Input() isDialogOpen = false;
  @Input() data: ProdLot[] = [];
  @Output() selectionChange = new EventEmitter<any>();
  localization = Localization;

  closeDialog() {
    this.isDialogOpen = false;
  }

  openDialog() {
    this.isDialogOpen = true;
  }

  onSelectionChange(event: any) {
    this.selectionChange.emit(event); 
    event.detail.selectedItems = [];
    event.detail.targetItem.selected = false;
    this.closeDialog();
  }
}
