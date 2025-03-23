import { Component, ViewChild } from '@angular/core';
import { RepairTypeComponent } from '@app/modules/tool-visu/tool-settings/repair-type/repair-type.component';

@Component({
  selector: 'app-tool-settings',
  templateUrl: './tool-settings.component.html',
  styleUrl: './tool-settings.component.css'
})
export class ToolSettingsComponent {
  @ViewChild('repairType') repairTypeMasterComponent?: RepairTypeComponent;

  loadRepairTable(event: any) {
    this.repairTypeMasterComponent!.fileterById(event);
  }

}
