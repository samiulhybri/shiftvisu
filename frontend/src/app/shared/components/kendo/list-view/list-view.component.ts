import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ListView } from 'src/app/shared/models/list-view';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss']
})
export class ListViewComponent  implements OnChanges {
	
	public activeItem?: string;

	@Input() public listViewConfig!: ListView;
	@Input() public events!: Array<any>;
	@Input() public onloadClick!: boolean;

	@Output() onClick = new EventEmitter<any>();

	ngOnChanges(changes: SimpleChanges) {
		if(changes['events']){
			let newEvents: any = changes['events'].currentValue
			if(newEvents.length && this.onloadClick) this.onSelect(newEvents[0])
		}
	}

	public onSelect(event: any) {
		this.onClick.emit(event);
		this.activeItem = event[this.listViewConfig.nameKey]
	}
}
