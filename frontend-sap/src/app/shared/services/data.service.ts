import { Injectable } from '@angular/core';
import { Permission } from '@app/shared/models/permission.model';
import { Role } from '@app/shared/models/role.model';
import { BehaviorSubject } from 'rxjs';
import { Machine } from '@app/shared/models/machine.model';
import { Hall } from '@app/shared/models/hall.model';
import { MachineGroup } from '@app/shared/models/machine-group.model';
import MachineState from '@app/shared/models/machine-state.model';
import { OrderDetails } from '../interfaces/OrderDetails';

@Injectable({
    providedIn: 'root'
})
export class DataService {
	private permissions: BehaviorSubject<Permission[]> = new BehaviorSubject<Permission[]>([]);
    private roles: BehaviorSubject<Role[]> = new BehaviorSubject<Role[]>([]);
    
    // for status board
    private statusboardMachines: BehaviorSubject<Machine[] | null> = new BehaviorSubject<Machine[] | null>(null);
    private statusboardHalls: BehaviorSubject<Hall[]> = new BehaviorSubject<Hall[]>([]);
    private statusboardMachineGroups: BehaviorSubject<MachineGroup[]> = new BehaviorSubject<MachineGroup[]>([]);

    // status board filter
    private selectedMachine: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
    private selectedMachineGroup: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
    private selectedHall: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
    
    private machine: BehaviorSubject<Machine> = new BehaviorSubject<Machine>(new Machine().deserialize({}));

    private orderDetailList: BehaviorSubject<OrderDetails[]> = new BehaviorSubject<OrderDetails[]>([]);
    private selectedOrderDetail: BehaviorSubject<OrderDetails | null> = new BehaviorSubject<OrderDetails | null>(null);

	constructor() { }

    get machine$() {
        return this.machine.asObservable();
    }

    set machineData(data: Machine) {
        this.machine.next(data)
    }


    // get permission list
    get permissions$() {
        return this.permissions.asObservable();
    }

    // set current permission list
    set permissionList(data: Permission[]) {
        this.permissions.next(data)
    }

    // get role list
    get roles$() {
        return this.roles.asObservable();
    }

    // set current role list
    set roleList(data: Role[]) {
        this.roles.next(data)
    }

    // set statusboard machine list
    set statusboardMachineList(data: Machine[] | null) {
        this.statusboardMachines.next(data)
    }

    // get statusboard machine list
    get statusBoardMachines$() {
        return this.statusboardMachines.asObservable();
    }

    // set statusboard machine group list
    set statusboardMachineGroupList(data: MachineGroup[]) {
        this.statusboardMachineGroups.next(data)
    }

    // get statusboard machine group list
    get statusBoardMachineGroups$() {
        return this.statusboardMachineGroups.asObservable();
    }

    // set statusboard hall list
    set statusboardHallList(data: Hall[]) {
        this.statusboardHalls.next(data)
    }

    // get statusboard hall list
    get statusBoardHalls$() {
        return this.statusboardHalls.asObservable();
    }

    // ************************** //

    set filterMachineId(data: number[]) {
        this.selectedMachine.next(data)
    }

    get filteredMachineIds$() {
        return this.selectedMachine.asObservable();
    }

    set filterMachineGroupId(data: number[]) {
        this.selectedMachineGroup.next(data)
    }

    get filteredMachineGroupIds$() {
        return this.selectedMachineGroup.asObservable();
    }

    set filterHallId(data: number[]) {
        this.selectedHall.next(data)
    }

    get filteredHallIds$() {
        return this.selectedHall.asObservable();
    }

    set orderDetails(data: OrderDetails[]) {
        this.orderDetailList.next(data)
    }

    get orderDetails$() {
        return this.orderDetailList.asObservable();
    }

    set selectedOrderDetails(data: OrderDetails | null) {
        this.selectedOrderDetail.next(data)
    }

    get selectedOrderDetailRaw() {
        return this.selectedOrderDetail;
    }

    get selectedOrderDetails$() {
        return this.selectedOrderDetail.asObservable();
    }
}
