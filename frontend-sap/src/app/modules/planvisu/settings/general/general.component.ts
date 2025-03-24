import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Setting } from '@app/shared/models/setting.model';
import { CommonService } from '@app/shared/services/common.service';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrl: './general.component.css'
})
export class GeneralComponent implements OnInit{
  switchValue?: boolean = false;
  planvisuGeneralSection: Setting[] = [];
  @Input() public divHeight!: string;
  @Output() planvisuGeneralSectionLoaded = new EventEmitter<Setting[]>();

  constructor( public commonService: CommonService ) { }
  
  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.commonService.get(`/Settings`).subscribe({
      next: (res: any) => {
        res.value.map((data: any) => {
          this.planvisuGeneralSection.push(new Setting().deserialize(data))
        });        
        this.switchValue = this.planvisuGeneralSection.length > 0 
          ? this.planvisuGeneralSection[0]?.show_customer 
          : false;
        this.planvisuGeneralSectionLoaded.emit(this.planvisuGeneralSection);
			},
			error: err => {
				console.error(err);
			},
		});
  }

  toggleSwitch() {
    this.switchValue = !this.switchValue;
    const payload = {
      show_customer: this.switchValue
    };
    this.commonService["put"](`/Settings(${this.planvisuGeneralSection[0].id})`, payload).subscribe({
      next: (response) => { }
    })
  }
}
