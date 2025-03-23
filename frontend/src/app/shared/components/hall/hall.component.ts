import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ListView } from 'src/app/shared/models/list-view';
import { CommonService } from 'src/app/shared/services/common.service';
@Component({
	selector: 'app-hall',
	templateUrl: './hall.component.html',
	styleUrls: ['./hall.component.scss']
})
export class HallComponent implements OnInit {

	public isLoading: boolean = false;
	public events: Array<any> = [];
	
	@Output() halls = new EventEmitter<any>()
	@Input() public filter!: String;

	public listMenu: ListView = {
		nameKey: 'name'
	};

	constructor(protected commonServices: CommonService) {

	}

	ngOnInit(): void {
		this.gethalle()
	}

	gethalle() {
		this.isLoading = true;
		let url = "Halls";
		if (this.filter) url += "?filter=" + this.filter;
		this.commonServices.get(url).subscribe({
			next: (response: any) => {
				this.isLoading = false;
				this.events = response.value
			}
		})
	}
}
