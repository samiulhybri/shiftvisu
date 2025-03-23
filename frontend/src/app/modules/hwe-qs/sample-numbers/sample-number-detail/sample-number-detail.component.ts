import { Component, Input, OnInit } from "@angular/core";

import { Observable, catchError, of, switchMap, tap, throwError } from "rxjs";

import { SampleNumber } from "@app/models/sample-number";
import { ProdOrderPos } from "@app/models/prod-order-pos";
import { HweQsSamplesProdOrderPos } from "@app/models/hew-qs-samples-prod-order-pos";

import { Notification } from "src/app/shared/services/notification.service";
import { CommonService } from "@app/shared/services/common.service";

import { GridComponent } from "@app/shared/components/kendo/grid/grid.component";
import { ComboFilter } from "@shared/classes/combo-filter";

@Component({
  selector: "app-sample-number-detail",
  templateUrl: "./sample-number-detail.component.html",
  styleUrls: ["./sample-number-detail.component.scss"],
})
export class SampleNumberDetailComponent implements OnInit {
  @Input("data") sampleNumber?: any;
  public previousData?: SampleNumber;
  public prodOrderPosValue?: ProdOrderPos;

  public isLoaderEnabled: boolean = false;
  public orderNumbers: [] = [];
  public cmbOrderNumbers:any;

  public hweQsSamplesProdOrderPos?: HweQsSamplesProdOrderPos;

  constructor(public _commonService: CommonService, public notification: Notification) {}

  ngOnInit(): void {
    this.getOrderNumbers();
    this.getSampleNumber();
  }

  // Getting Initial Sample Number from Grid
  private getSampleNumber(): void {
    if (this.sampleNumber === undefined) {
      this.sampleNumber = new SampleNumber();
      this.prodOrderPosValue =  new ProdOrderPos();
      this.getOfferCustomId();
    } else {
      this.previousData = JSON.parse(JSON.stringify(this.sampleNumber));
      let prodOrderPos = this.sampleNumber?.samplesProdOrderPos?.prodOrderPos;

      if (prodOrderPos) {
        this.prodOrderPosValue = prodOrderPos as ProdOrderPos;
      } else {
        this.prodOrderPosValue =  new ProdOrderPos();
      }
    }
    
    this.sampleNumber.date = this.sampleNumber?.date ? new Date(this.sampleNumber?.date): new Date();
  }

  // Generates sample number's custom id
  private async getOfferCustomId(): Promise<void> {
    this.isLoaderEnabled = true;
      let value = await this._commonService
        .getEntity("HweqsSamples")
        .catch(() => false);
      if (value) {
        this.sampleNumber!.custom_id = value;
      }

    this.isLoaderEnabled = false;
  }

  // Called when user is selecting order number
  public onSelectOrder(value: any): void {
    this.hweQsSamplesProdOrderPos = new HweQsSamplesProdOrderPos();
    this.hweQsSamplesProdOrderPos.prod_order_pos = new ProdOrderPos();

    this.hweQsSamplesProdOrderPos.sample_number = this.sampleNumber;

    if (this.hweQsSamplesProdOrderPos.prod_order_pos) {
        this.hweQsSamplesProdOrderPos.prod_order_pos.id = value;
    }
  }

  // Get Prod Order Pos data and prepare it for dropdown selection
  private getOrderNumbers(): void {
    this.isLoaderEnabled = false;
    this._commonService.get("ProdOrderPos?$expand=prodOrder").subscribe({
      next: (res: any) => {
        this.orderNumbers = res.value.map((item: any) => ({
          value: parseInt(item?.id),
          text: `${item?.prodOrder?.custom_id} - ${item?.pos}`,
        }));

        this.cmbOrderNumbers = new ComboFilter(this.orderNumbers);

        this.isLoaderEnabled = false;
      },
      error: () => (this.isLoaderEnabled = false),
    });
  }

  /*
    Custom fields are employed for displaying nested data in grid.
    These fields need be to deleted before performing an update.
  */
  private deleteCustomFields(): void {
    if (this.sampleNumber?.order_number || this.sampleNumber?.order_number === "") { 
      ['order_number', 'isLast', 'material_custom_id', 'testingScope_attestation', 'customer_name', 'heatTreatment_type']
        .forEach(prop => delete this.sampleNumber?.[prop]);
    };
  }

  onUpdate(e: any, grid: GridComponent) {
    this.deleteCustomFields();

    if (!this.sampleNumber?.custom_id?.trim()) {
      grid.isWindowLoaderEnabled = false;
      return new Observable((observer) => {
        observer.error($localize`Custom ID is required.`);
      });
    }
    
    const data = new SampleNumber().deserialize(this.sampleNumber).toOdata();
    
    return this._commonService.put(
      `HweQsSamples(${this.sampleNumber?.id})`,
      data
    ).pipe(
      switchMap((sample: any) => {
        const samplesProdOrderPos = this.sampleNumber?.samplesProdOrderPos;

        if (samplesProdOrderPos) {
          if (!this.hweQsSamplesProdOrderPos?.prod_order_pos?.id) {
              if (this.hweQsSamplesProdOrderPos) this.hweQsSamplesProdOrderPos.sample_number = sample;

              if (this.isProdOrderPosIdUnchanged()) {
                return this.deleteSamplesProdOrderPosBySampleId(this.sampleNumber?.samplesProdOrderPos?.id);
            } else {
                return of(sample);
            }
          } else {
              return this.addHweQsSamplesProdOrderPos(this.hweQsSamplesProdOrderPos!);
          }
        } else {
            return this.addHweQsSamplesProdOrderPos(this.hweQsSamplesProdOrderPos!);
        }
      }),
      catchError((error: any) => {
        console.error('An error occurred:', error);
        return throwError('There was an error processing the request');
      })
    );
  }
  
  // To check if order number selection is changed or not 
  private isProdOrderPosIdUnchanged(): boolean {
    return this.sampleNumber?.samplesProdOrderPos?.prodOrderPos.id === this.previousData?.samplesProdOrderPos?.prod_order_pos?.id
  }
  
  // Deleting previous prod order pos of a specific sample before inserting new one
  private deleteSamplesProdOrderPosBySampleId(id: number): Observable<any> {
    if (id) {
      return this._commonService
      .delete(`HweQsSamplesProdOrderPos/${id}`)
      .pipe(
        catchError((error: any) => {
          // Handle the error
          console.error('An error occurred:', error);
          return throwError('There was an error processing the delete request');
        })
      );
    } else {
      return of(true)
    }
  }

  // Prepare and post data for saving Samples with Prod Order Pos
  private addHweQsSamplesProdOrderPos(samplesProdOrderPos: HweQsSamplesProdOrderPos): Observable<Object> {
    let sampleProdOrderPos = {
        prod_order_pos_id : samplesProdOrderPos?.prod_order_pos?.id,
        hwe_qs_sample_id : samplesProdOrderPos?.sample_number?.id,
    };

    return this._commonService.post(`HweQsSamplesProdOrderPos`, sampleProdOrderPos).pipe(
      tap(() => {
        this.getOrderNumbers();
      }),
      catchError((error: any) => {
        console.log(error);
        this.notification.showError($localize`Duplicate Entry for Same Order Number`);
        return throwError(error);
      }));
  }

  onAdd(e: any, grid: GridComponent) {
    if (!this.sampleNumber!.custom_id?.trim()) {
      grid.isWindowLoaderEnabled = false;
      return new Observable((observer) => {
        observer.error($localize`Custom ID is required.`);
      });
    }

    return this._commonService
    .post(`HweQsSamples`, this.sampleNumber!.toOdata())
    .pipe(
      switchMap((sample: any) => {
        if (this.hweQsSamplesProdOrderPos?.prod_order_pos?.id) {
          this.hweQsSamplesProdOrderPos.sample_number!.id = sample?.id;
          return this.addHweQsSamplesProdOrderPos(this.hweQsSamplesProdOrderPos);
        }

        return of(true);
      }),
      catchError(error => {
        // Handle errors if any of the steps fail
        console.error('An error occurred:', error);
        return of(null);
      })
    );
  }

  handleFilter(value: String, src: String) {
    switch (src) {
      case "Order":
        this.orderNumbers =
            this.cmbOrderNumbers.handleLocalDataFilter(
                value,
                "text",
            );
        break;

    }
  }
}
