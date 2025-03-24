import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

// Models
import { User } from 'src/app/models/user';
import { MaterialConsumption } from 'src/app/models/material-consumption';

import { ComboFilter } from 'src/app/shared/classes/combo-filter';

@Component({
  selector: 'app-employee-information',
  templateUrl: './employee-information.component.html',
  styleUrls: ['./employee-information.component.scss']
})
export class EmployeeInformationComponent implements AfterViewInit {
    @Input() public employeeFormGroup: FormGroup = new FormGroup({});
    @Input() public users: User[] = [];
    @Input() public materials: MaterialConsumption = new MaterialConsumption();

    @Output() private userSelection: EventEmitter<number> = new EventEmitter<number>();

    public defaultSelectedUser: { id: number | null, name: string } = {
      id: null,
      name: $localize`Select User`,
    };

    public userFliter: ComboFilter = {} as ComboFilter;

    public ngAfterViewInit(): void {
			this.userFliter = new ComboFilter(this.users);
    }

    public userSelectionChange(id: number): void {
      this.userSelection.emit(id);
    }

    public handleFilter(value: string): void {
    	this.users = this.userFliter.handleLocalDataFilter(
				value,
				"name"
			);
    }
}
