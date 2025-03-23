import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CardType } from 'src/app/shared/enums/card-type.enum';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input('title') public title: string = '';
  @Input('list') public data: any[] = [];
  @Input('isMultipleSelectionEnabled') public selection: boolean = false;
  @Input('showCustomId') public showCustomId: boolean = true;
  @Input('showOnlyCustomId') public showOnlyCustomId: boolean = false;
  @Input('type') public type: CardType = CardType.FURNACE;

  @Output() private returnData = new EventEmitter<any[]>();
  @Output() private onReset = new EventEmitter<any>();

  ngOnInit() {
    if (typeof this.data === 'string') {
      this.http.get<any[]>(this.data).subscribe(data => {
        this.data = data;
      });
    } 
  }

  constructor(private http: HttpClient) {}

  public onClick(index: number): void {
    if (!this.selection) {
      this.reset()
    }

    this.data[index].isSelected =  !this.data[index].isSelected;

    if (CardType.FURNACE || CardType.ALLOY || CardType.CRUCIBLE) {
      this.returnData.emit([this.data, index, this.type]);
    }

    if (CardType.MACHINE) {
      const selectedItems = this.data.filter(item => item.isSelected);
      this.returnData.emit([this.data, index, this.type, selectedItems]);
    }
  }

  public reset(): void {
    for (let val of this.data) {
      val.isSelected = false;
    }

    this.onReset.emit(this.type);
  }
}
