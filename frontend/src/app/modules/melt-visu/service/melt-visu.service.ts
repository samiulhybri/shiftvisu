import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { MaterialConsumption } from "src/app/models/material-consumption";
import { GridColumn, GridItemAlign } from "src/app/shared/models/grid-column.model";

import { CommonService } from "src/app/shared/services/common.service";
import { ConnectionService } from "src/app/shared/services/connection.service";

// Pre-defined type for the batch request body
type RequestData = {
  requests: SingleRequest[];
};

type SingleRequest = {
  id: string | number;
  method: string;
  url: string;
};

@Injectable({
  providedIn: "root",
})
export class MeltVisuService {
  // Url string for batch request
  public alloyString: string = "Items";
  public machineString: string = "Machines";
  public crucibleString: string = "Crucibles";
  public userString: string = "Users";

  // Url Strings for Material Consumption
  public baseQueryString: string = "MaterialConsumptions";
  public materialConsumptionMachinesString: string = "MaterialConsumptionMachines";
  public alloyQueryString: string = "item";
  public furnaceQueryString: string = "furnace";
  public userQueryString: string = "user";
  public machinesQueryString: string = "machines";
  public selectQueryString: string = "select=name,id,custom_id";
  public orderByString: string = "&$orderby=id desc";
  public orderByCustomId: string = "$orderby=custom_id"
  public filter: string = "filter=";
  public odata: string = "odata";
  public equalOne: string = "eq 1";
  public createdAtString: string = "created_at";
  public greaterStr: string = "ge";
  public lesserStr: string = "le";
  public equalStr: string = "eq";
  public andStr: string = "and";

  public isConnected: boolean = false;

  // Used Http methods for lodata
  public GET_METHOD: string = "get";
  public DELETE_METHOD: string = "delete";

  // navigation
  public entryNavigationPath: string = "/melt-visu/entry";
  public overviewNavigationPath: string = "/melt-visu/overview";
  public editNavigation: string = "/melt-visu/edit/";


  constructor(public commonService: CommonService, public connection: ConnectionService) {
    this.connection.monitor().pipe(
    ).subscribe((connected: boolean) => {
      // isConnected determines if the internet is connected or not
      // Used for handing some interective errors and better user experience 
      this.isConnected = connected;
    });
  }

  public insertMaterialConsumption(body: MaterialConsumption): Observable<any> {
    return this.commonService.post(this.baseQueryString, body);
  }

  public editMaterialConsumptionById(id: number, body: MaterialConsumption): Observable<any> {
    return this.commonService.put(`${this.baseQueryString}/${id}`, body);
  }

  public generateRequestBody(ids: number[]): RequestData {
    const requestBody = ids.map((id, index): SingleRequest => {
      return {
        id: index,
        method: this.DELETE_METHOD,
        url: `/${this.odata}/${this.materialConsumptionMachinesString}/${id}`
      }
    });

    return { requests: requestBody };
  }

  private getRequestData(id: number): RequestData {
    const requestedData: RequestData = {
      requests: [
        {
          id: "0",
          method: this.GET_METHOD,
          url: `/${this.odata}/${this.baseQueryString}/${id}`
        },
        {
          id: "1",
          method: this.GET_METHOD,
          url: `/${this.odata}/${this.baseQueryString}/${id}/${this.machinesQueryString}`
        }
      ]
    };

    return requestedData;
  }

  // batch request data object
  private requestData: RequestData = {
    requests: [
      {
        id: "0",
        method: this.GET_METHOD,
        url: `/${this.odata}/${this.machineString}?${this.filter}is_furnace ${this.equalOne}&${this.orderByCustomId}`,
      },
      {
        id: "1",
        method: this.GET_METHOD,
        url: `/${this.odata}/${this.machineString}?${this.filter}is_casting_machine ${this.equalOne}&${this.orderByCustomId}`,
      },
      {
        id: "2",
        method: this.GET_METHOD,
        url: `/${this.odata}/${this.alloyString}?${this.filter}is_alloy ${this.equalOne}&${this.orderByCustomId}`,
      },
      {
        id: "3",
        method: this.GET_METHOD,
        url: `/${this.odata}/${this.crucibleString}?${this.orderByCustomId}`,
      },
      {
        id: "4",
        method: this.GET_METHOD,
        url: `/${this.odata}/${this.userString}/?$filter=is_melter eq 1`,
      },
    ],
  };

  // Batch request for fetching furnaces, alloys, crucibles, machines, users
  public getAllData(): Observable<any> {
    return this.commonService.post('$batch', this.requestData);
  }

  public getMaterialConsumptionById(id: number): Observable<any> {
    return this.commonService.post("$batch", this.getRequestData(id));
  }

  public getMaterialConsumptionMachinesById(id: number): Observable<any> {
    return this.commonService.get(`/${this.materialConsumptionMachinesString}?${this.filter}material_consumption_id ${this.equalStr} ${id}`);
  }

  public deleteMaterialConsumptionMachines(body: RequestData): Observable<any> {
    return this.commonService.post("$batch", body);
  }

  public formatDate(date: Date, isEnd: boolean = false): string {
    const year: number = date.getFullYear();
    const month: string = String(date.getMonth() + 1).padStart(2, '0');
    let day: string = String(date.getDate()).padStart(2, '0');

    if (isEnd) {
      day = String(Number(day) + 1).padStart(2, '0');
    }

    return `${year}-${month}-${day}`;
  }

  public getMaterialConsumptionFetchUrl(isDateFilter: boolean = false, range: any = {}): string {
    const expandQuery: string = `${this.baseQueryString}?$expand=` +
      `${this.userQueryString}(${this.selectQueryString}),` +
      `${this.alloyQueryString}(${this.selectQueryString}),` +
      `${this.furnaceQueryString}(${this.selectQueryString}),` +
      `${this.machinesQueryString}(${this.selectQueryString})` +
      `${this.orderByString}`;

    if (isDateFilter) {
      const start: string = this.formatDate(range.start);
      const end: string = this.formatDate(range.end, true);

      const dateFilterStr: string = `&$${this.filter}${this.createdAtString} ${this.greaterStr} ${start} ${this.andStr} ${this.createdAtString} ${this.lesserStr} ${end}`;
      return expandQuery + dateFilterStr;
    } else {
      return expandQuery;
    }
  }

  public getMeltingHistoryGridColumns(): GridColumn[] {
    return [
      {
        name: "furnace",
        title: $localize`Furnace`,
        template: true,
        isRelation: true,
		    key: ['custom_id', 'name'],
        hideColumnMenu: true,
        textAlign: GridItemAlign.LEFT,
        filterable: true,
        filterType: "multilayer"
      },
      {
        name: "item.name",
        title: $localize`Alloy`,
        hideColumnMenu: true,
        filterable: true,
        filterType: "multilayer"
      },
      {
        name: "user",
        title: $localize`Person`,
        template: true,
        isRelation: true,
		    key: ['custom_id', 'name'],
        hideColumnMenu: true,
        filterable: true,
        filterType: "multilayer"
      },
      {
        name: "quantity",
        title: $localize`Weight`,
        filterable: true,
      },
      {
        name: "created_at",
        title: $localize`Time`,
        filterType: "date",
        dateFormat: 'dd.MM.yyy HH:mm:ss'
      },
      {
        name: "machines",
        filterType: "template",
        sub_field: ['custom_id'],
        title: $localize`Machines`,
        hideColumnMenu: true,
        width: 400
      },
    ];
  }
}
