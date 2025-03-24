import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { Subject, map, mergeMap, of, takeUntil, tap } from "rxjs";

import { CardType } from "src/app/shared/enums/card-type.enum";
import { YesNoType } from "src/app/enums/yes-no-type";

// Services
import { CommonService } from "src/app/shared/services/common.service";
import { MeltVisuService } from "src/app/modules/melt-visu/service/melt-visu.service";
import { Notification } from "src/app/shared/services/notification.service";

// Models
import { Machine } from "src/app/models/machine";
import { Item } from "src/app/models/item";
import { User } from "src/app/models/user";
import { Crucible } from "src/app/models/crucible";
import { MaterialConsumption } from "src/app/models/material-consumption";

interface Response {
  "@context": string;
  value: any;
}

@Component({
  selector: "app-melt-visu-entry",
  templateUrl: "./entry.component.html",
  styleUrls: ["./entry.component.scss"],
})
export class EntryComponent {
  public employeeFormGroup: FormGroup = new FormGroup<any>({});

  public materials: MaterialConsumption = new MaterialConsumption();
  public origialMaterialValue: MaterialConsumption = new MaterialConsumption();

  public furnace: Machine[] = [];
  public alloy: Item[] = [];
  public machines: Machine[] = [];
  public crucibles: Crucible[] = [];
  public users: User[] = [];
  public selectedMachines: number[] = [];
  public selectedMaterialConsumptionId: number = 0;
  public materialConsumptionMachinesIds: number[] = [];

  public isLoaderEnabled: boolean = false;
  public isEditMode: boolean = false;
  public dialogOpened: boolean = false;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    public meltVisuService: MeltVisuService,
    public commonService: CommonService,
    public router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public notification: Notification
  ) {
    this.employeeFormGroup = this.fb.nonNullable.group({
      employeeNumber: [""],
      employeeName: [""],
      actualWeight: [0, Validators.required],
    });

    this.route.params.subscribe(params => {
      const id: number = params['id'];
      if (id) {
        // Enabling edit mode based on, if route has Id param or not
        this.isEditMode = true;

        this.selectedMaterialConsumptionId = id;
      }
    });

    this.getAllData();
  }

  get eCardType() {
    return CardType;
  }

  get eDialogeStatus() {
    return YesNoType;
  }

  private hasChanged(originalValue: {}, value: {}): boolean {
    // Later, to check if the value has changed or not
    return JSON.stringify(originalValue) !== JSON.stringify(value) || !this.isMachineSelected();
  }

  public open(): void {
    this.dialogOpened = true;
  }

  public close(): void {
    this.dialogOpened = false;
  }

  public action(status: YesNoType): void {
    if (status === YesNoType.YES) {
      this.navigateToListPage()
    } else {
      this.dialogOpened = false;
    }
  }

  public getCardData(data: any[]): void {
    const [list, index, type, selectedMachines] = data;
  
    switch (type) {
      case CardType.FURNACE:
        this.materials.furnace_id = list[index]?.id;
        break;
      case CardType.ALLOY:
        this.materials.item_id = list[index]?.id;
        break;
      case CardType.MACHINE:
        this.selectedMachines = selectedMachines ?? [];
        break;
      case CardType.CRUCIBLE:
        this.employeeFormGroup.patchValue({ actualWeight: list[index]?.capacity });
        this.materials.quantity = list[index]?.capacity ?? 0;
        break;
      default:
        break;
    }
  }

  // The event here dispatches index of the selected user
  public userSelectionChange(id: number): void {
    if (id) {
      this.employeeFormGroup.patchValue({ employeeNumber: id });
      this.materials.user_id = id;
    } else {
      this.employeeFormGroup.patchValue({ employeeNumber: "" });
      this.materials.user_id = null;
    }
  }

  private setSelection(data: any[], selectionString: string, selectedIds: number | any[]): any {
    if (Array.isArray(selectedIds)) {
      return data.map((item: any) => {
        if (selectedIds.includes(item[selectionString])) {
          item.isSelected = true;
        }
        return item;
      });
    } else {
      const selectedItem = (data as any)?.find((item: any) => item[selectionString] === selectedIds);

      if (selectedItem) {
        selectedItem.isSelected = true;
      }
  
      return selectedItem;
    }
  }

  private getObjectValue<T>(object: { body?: { value?: T } }): T | any {
    return object.body?.value;
  }

  public async getAllData(): Promise<any> {
    this.isLoaderEnabled = true;
  
    this.meltVisuService
      .getAllData()
      .pipe(
        takeUntil(this.unsubscribe$),
        mergeMap((data: any) => {
          const [furnaces, machines, alloys, crucibles, users] = data?.responses;

          this.getObjectValue(furnaces).forEach((furnace: Machine) => {
            this.furnace?.push(new Machine().deserialize(furnace));
          });

          this.getObjectValue(machines).forEach((machine: Machine) => {
            this.machines?.push(new Machine().deserialize(machine));
          });

          this.getObjectValue(alloys).forEach((item: Item) => {
            this.alloy?.push(new Item().deserialize(item));
          });

          this.getObjectValue(users).forEach((user: User) => {
            this.users?.push(new User().deserialize(user));
          });

          this.users?.forEach(user => {
            user.name = `${user.custom_id} - ${user.name}`;
          });
          
          this.getObjectValue(crucibles).forEach((crucible: Crucible) => {
            this.crucibles?.push(new Crucible().deserialize(crucible));
          });
    
          if (this.isEditMode) {
            return this.meltVisuService.getMaterialConsumptionMachinesById(this.selectedMaterialConsumptionId).pipe(
              mergeMap((materialConsumptionMachines: Response) => {
                const materialConsumptionMachinesIds: any = materialConsumptionMachines?.value.map((item: Machine) => item.id);

                return this.meltVisuService.getMaterialConsumptionById(this.selectedMaterialConsumptionId)
                  .pipe(tap(() => {
                    this.materialConsumptionMachinesIds = materialConsumptionMachinesIds;
                  }))
                  .pipe(map((materialConsumptionMachines: any) => {
                    const [materialConsumption , machines] = materialConsumptionMachines?.responses;

                    if (materialConsumption?.status === 200 && machines?.status === 200) {
                      const selectedMaterialConsumption =  (materialConsumption?.body as any);
                      const selectedMachines = this.selectedMachines = (machines?.body as any)?.value.map((item: Machine) => item?.id) ?? [];
                      this.setSelection(this.machines, 'id', selectedMachines);
        
                      this.setSelection(this.furnace, 'id', selectedMaterialConsumption?.furnace_id);
                      this.setSelection(this.alloy, 'id', selectedMaterialConsumption?.item_id);

                      if (selectedMaterialConsumption?.user_id) {
                        const user = this.setSelection(this.users, 'id', selectedMaterialConsumption?.user_id);
                        this.userSelectionChange(user.id);

                        this.employeeFormGroup.patchValue({
                          employeeName: user?.id,
                          actualWeight: selectedMaterialConsumption?.quantity
                        });
                      } else {
                        this.employeeFormGroup.patchValue({
                          employeeName: '',
                          actualWeight: selectedMaterialConsumption?.quantity
                        });
                      }
        
                      this.materials = { ...selectedMaterialConsumption };
                    } else {
                      this.navigateToListPage();
                    }
                  })
                );
              })
            )
          } else {
            return of([]);
          }
        })
      )
      .pipe(tap(() => {
        this.isLoaderEnabled = false;
      }))
      .subscribe(
        () => {},
        (error) => {
          console.error(error);
          this.isLoaderEnabled = false;
          this.navigateToListPage();
        }
      );
  }

  // This function is used for both add and save based on "isEditMode" value
  public saveMaterialConsumption(): void {
    if (this.meltVisuService.isConnected) {
      // Extra check for form validity
      if (this.isValidForm()) return;

      this.isLoaderEnabled = true;
      // Assigning the latest quantity
      this.materials.quantity = this.employeeFormGroup.value?.actualWeight;

      const selectedMachineIds: { machine_id: any; }[] = this.machines
        .filter(machine => machine.isSelected)
        .map(machine => {
          return { "machine_id" : machine.id }
        });

      this.materials.machineConsumptions = selectedMachineIds;

      if (this.isEditMode) {
        // Update
        const requests: any = this.meltVisuService.generateRequestBody(this.materialConsumptionMachinesIds); // type : RequestData

        this.meltVisuService.deleteMaterialConsumptionMachines(requests).pipe(
          mergeMap(() => {
            return this.meltVisuService.editMaterialConsumptionById(this.selectedMaterialConsumptionId, this.materials)
          })
        ).subscribe(
          () => {
            // Handle successful response here
            this.notification.showSuccess($localize`successfully updated`);
            this.navigateToListPage();
          },
          (error: Error) => {
            console.error(error);
            // Handle error response here
          },
        );
      } else {
        // Entry
        this.meltVisuService.insertMaterialConsumption(this.materials)
        .subscribe(
          () => {
            // Handle successful response here
            this.notification.showSuccess($localize`successfully saved`);
            this.navigateToListPage();
          },
          (error: Error) => {
            console.error(error);
            // Handle error response here
            this.notification.showError($localize`Something went wrong`);
            this.navigateToListPage();
          }
        );
      }
    }
  }

  private isMachineSelected(): boolean {
    return this.selectedMachines.length <= 0 ?? false;
  }

  public isValidForm(): boolean {
    return !(
      this.materials.item_id &&
      this.materials.furnace_id &&
      // this.materials.user_id &&
      this.materials.quantity &&
      this.selectedMachines &&
      this.employeeFormGroup.valid
    );
  }

  public resetCard(type: CardType): void {
    switch (type) {
      case CardType.CRUCIBLE:
        this.employeeFormGroup.patchValue({ actualWeight: 0 });
        break;
      case CardType.FURNACE:
        this.materials.furnace_id = 0;
        break;
      case CardType.ALLOY:
        this.materials.item_id = 0;
        break;
      case CardType.MACHINE:
        this.selectedMachines = [];
        break;
      default:
        break;
    }
  }

  public closeEntry(): void {
    this.materials.quantity = this.employeeFormGroup.value?.actualWeight;

    if (this.hasChanged(this.origialMaterialValue, this.materials) && !this.isEditMode) {
      this.open();
    } else {
      this.navigateToListPage();
    }
  }

  public navigateToListPage(): void {
    this.router.navigate([this.meltVisuService.overviewNavigationPath]);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
