import { array } from '@amcharts/amcharts5';
import { Component } from '@angular/core';
import { AuthService } from '@app/shared/services/auth.service';
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from '@app/shared/services/toaster.service';
import { Localization } from "@app/shared/utils/common-localize";
import Toast from '@ui5/webcomponents/dist/Toast';
import * as XLSX from "xlsx";

@Component({
  selector: 'app-export-import',
  templateUrl: './export-import.component.html',
  styleUrl: './export-import.component.css'
})
export class ExportImportComponent {
  constructor(
    public commonService: CommonService,
    public authService: AuthService,
    public _toasterSrv: ToastService
  ) { }
  localization = Localization;
  isBusy = false;
  tempFiles = [];
  deletedSavedFiles = [];
  selectedCustomer:any = {};
  checkForNewAttachments = false;
  attachmentCount = 0;
  selectedStandardFile = {};
  isAttchmentDialogOpen = false;
  toastMessage?:string
  customersFileHeaders = ['Firmenname', 'Dealfront ID', 'ID', 'Firmenbeschreibung', 'Übersetzte Beschreibung', 'Straße & Hausnummer', 'Straße', 'Hausnummer', 'Ort', 'PLZ', 'Land', 'Ländercode', 'Gesellschaftsform', 'Registernummer', 'Amtsgericht', 'Art der Registernummer', 'Gründungsjahr', 'Umsatzsteuer-ID', 'Registerstatus', 'E-Mail-Adresse', 'Telefonnummer', 'Faxnummer', 'CONNECT-Link', 'Webseite', 'Firmendomains', 'Mitarbeiterzahl', 'Xing Account', 'LinkedIn Account', 'Twitter Account', 'Facebook Account', 'YouTube Account', 'Pinterest Account', 'Instagram Account', 'eCommerce & Shopsysteme', 'Content & Web Systeme', 'Payment-Lösungen', 'Branche', 'Weitere Branchen', 'NACE-Codes', 'NACE-Code (Ebene 1)', 'Beschreibung NACE-Code (Ebene 1)', 'NACE-Code (Ebene 2)', 'Beschreibung NACE-Code (Ebene 2)', 'WZ-Codes', 'WZ-Code', 'Market Segment', 'Beschreibung WZ-Code', 'Branche (Hauptkategorie)', 'Branche (Unterkategorie)', 'Branchenidentifikation', 'Umsatz', 'Währung (Umsatz)', 'Umsatzquelle', 'Gewinn', 'Bilanzsumme', 'Währung', 'Jahresabschlusstyp', 'Berichtsjahr'];
  contactsFileHeaders= ['Anrede', 'Titel', 'Vorname', 'Nachname', 'ID', 'Jobtitel', 'Abteilung', 'Hierarchie', 'Kontaktstandort (Land)', 'Kontaktstandort', 'Telefonnummer', 'Durchwahl', 'Handynummer', 'Firmennummer', 'Faxnummer', 'E-Mail-Adresse', 'E-Mail-Status', 'E-Mail-Validierungs-Status', 'Xing Account', 'LinkedIn Account', 'Weitere Quellen', 'Dealfront Firmen ID', 'Firmen-ID', 'Firmenname', 'Firmenbeschreibung', 'Übersetzte Beschreibung', 'Straße & Hausnummer', 'Straße', 'Hausnummer', 'Ort', 'PLZ', 'Land', 'Ländercode', 'Gesellschaftsform', 'Registernummer', 'Amtsgericht', 'Art der Registernummer', 'Gründungsjahr', 'Umsatzsteuer-ID', 'Registerstatus', 'E-Mail-Adresse (Firma)', 'Telefonnummer (Firma)', 'Faxnummer (Firma)', 'CONNECT-Link', 'Webseite', 'Firmendomains', 'Mitarbeiterzahl', 'Xing Account (Firma)', 'LinkedIn Account (Firma)', 'Twitter Account (Firma)', 'Facebook Account (Firma)', 'YouTube Account (Firma)', 'Pinterest Account (Firma)', 'Instagram Account (Firma)', 'eCommerce & Shopsysteme', 'Content & Web Systeme', 'Payment-Lösungen', 'Branche', 'Weitere Branchen', 'NACE-Codes', 'NACE-Code (Ebene 1)', 'Beschreibung NACE-Code (Ebene 1)', 'NACE-Code (Ebene 2)', 'Beschreibung NACE-Code (Ebene 2)', 'WZ-Codes', 'WZ-Code', 'Beschreibung WZ-Code', 'Branche (Hauptkategorie)', 'Branche (Unterkategorie)', 'Branchenidentifikation', 'Umsatz', 'Währung (Umsatz)', 'Umsatzquelle', 'Gewinn', 'Bilanzsumme', 'Währung', 'Jahresabschlusstyp', 'Berichtsjahr'];
  onAttachmentChanges(event:any, type:string){
    this.tempFiles  = event
    if(this.tempFiles.length > 2){
      this.tempFiles.splice(2,1);
      this.showModalToast($localize`Max two files`, 'information')
    }
    this.tempFiles.forEach((item: any, index: number) => {
      if (item?.name != 'Customers.xlsx' && item?.name != 'Contacts.xlsx') {
          this.tempFiles.splice(index, 1);
          this.showModalToast($localize`Please upload expected files`, 'error')
      }else{
        const reader = new FileReader();
        let fileHeaders:any
        if(item?.name == 'Customers.xlsx' || item?.name == 'Contacts.xlsx'){
          
          reader.onload = (e:any)=>{
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
  
          // Get the first sheet
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
  
          // Convert to JSON
          const range = XLSX.utils.decode_range(sheet['!ref']!); // Get the sheet range
          const firstRow = range.s.r; // Get first row index
          const headers: string[] = [];
    
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: firstRow, c: col }); // Get cell reference
            const cell = sheet[cellAddress]; // Access the cell
    
            if (cell && cell.v) {
              headers.push(cell.v.toString()); // Store column name
            }
          }
          fileHeaders = headers;
         }
         reader.readAsArrayBuffer(item);
        }
        if(item?.name == 'Customers.xlsx'){
          if(this.arraysEqual(fileHeaders, this.customersFileHeaders)){            
            this.tempFiles.splice(index, 1);
            this.showModalToast($localize`Your Customers Data are not correct`, 'error');
          }
        }
        if(item?.name == 'Contacts.xlsx'){
          if(this.arraysEqual(fileHeaders, this.contactsFileHeaders)){
            this.tempFiles.splice(index, 1);
            this.showModalToast($localize`Your Contacts Data are not correct`, 'error');
          }
        }
      }
    });
    this.attachmentCount = this.tempFiles.length
  }
  runOperation(type: string) {
    if(this.tempFiles.length > 1){
      const formData = new FormData();
      this.tempFiles.forEach((file:any)=>{
        if(file.name == 'Customers.xlsx'){
          formData.append('file1', file)
        }
        if(file.name == 'Contacts.xlsx'){
          formData.append('file2', file)
        }
      })
      this.isBusy = true
      this.commonService.post('crm/import/exel-import', formData, false).subscribe({
        next: (res: any) => {
          if (res.success) {
            this._toasterSrv.showToast($localize`Data import successfully`, 'success')
            this.tempFiles = [];
            this.attachmentCount = 0;
          } else {
            this._toasterSrv.showToast($localize`Something wrong with your excel file`, 'success')
          }
          this.isBusy = false;
        }
      })
    }else{
      this._toasterSrv.showToast($localize`Please Insert expected files`, 'error')
    }
  }
  arraysEqual(arr1:any, arr2:any) {
    if (arr1?.length !== arr2?.length) {
      return false;
    }
    
    for (let i = 0; i < arr1?.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
  
    return true;
  }
  checkFiles(){
    if(this.tempFiles.length < 2){
      this.showModalToast($localize`Please select expected two files`, 'information')
      return;
    }else{
      this.isAttchmentDialogOpen = false;
    }
  }
  showModalToast(message: string, type: string) {
    
    this.toastMessage = message;
    const toast = document.getElementById("detailModalToast") as Toast;
    toast.setAttribute("z-index", "999999");
    toast.setAttribute("display", "block");
    toast.className = this._toasterSrv.setToasterType(type);
    toast.open = true;
  }
}
