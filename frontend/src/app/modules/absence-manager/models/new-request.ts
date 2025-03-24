import { Deserializable } from "../../../interfaces/deserializable";
import { User } from "@app/models/user";
import { AbsenceTypes } from "./absence-types";
import { AbsenceStatus } from '@app/enums/absence-status'
import * as moment from "moment";
export class AbsenceRequest implements Deserializable {
    id?: number;
    user?: User;
    start!: Date | undefined;
    end!: Date  | undefined;
    is_read: boolean = false;
    status?: AbsenceStatus = AbsenceStatus.PENDING;
    total_hour: number = 0;
    absenceType?: AbsenceTypes;
    approvedBy?: User;
    applicant_note?: string = '';
    isDetailsModal?: boolean;
    pageName?: string;
    supervisor_note?: string = ''
    approval_time?: Date;
    timeDivisionValue: number = 1000 * 60 * 60;
    totalHourDependentValue: number = 8;
    is_full_day:boolean = false;
    date!:any;
    startTimeN!: Date | undefined;
    endTimeN!:Date | undefined;
    startMin?:Date;
    startMax?:Date;
    endMin?:Date;
    endMax?:Date;
    requestCreatedTime?:Date;
    deserialize(input: any) {
        input.date = !input.is_full_day  ?   new Date(input.start) : ''
        input.startTimeN = !input.is_full_day ? this.convToFormat(input.start, "TIME") : ''
        input.endTimeN = !input.is_full_day ? this.convToFormat(input.end, "TIME") : ''
        
        input.start = new Date(input.start)
        input.end = new Date(input.end)
        
        input.requestCreatedTime = input.created_at ? new Date(input.created_at) : ''
        input.approvalDate = input.approval_time ? new Date(input.approval_time) : ''
        input.approvalTime = input.approval_time ? new Date(input.approval_time) : ''
        input.approval_time = input.approval_time ? new Date(input.approval_time) : ''
        this.user = input.user ? new User().deserialize(input.user) : new User();
        this.absenceType = input.absenceType ? new AbsenceTypes().deserialize(input.absenceType) : new AbsenceTypes();
        this.approvedBy = input.approvedBy ? new User().deserialize(input.approvedBy) : new User();
        Object.assign(this, input);
        return this;
    }
    toOdata(): Object {
        let temp_is_full_day = this.is_full_day
        let tempStart = this.start
        let tempEnd = this.end
        let tempTotalHour = this.total_hour

        if(!this.isDetailsModal){
            
            if(!this.is_full_day){
                if(this.total_hour >= 8){
                    temp_is_full_day = true;
                    tempStart = new Date(this.startTimeN!.setHours(0,0,0))
                    tempEnd = this.endTimeN
                    tempTotalHour = 1;
                }
            }
            
        }

       
        return {
            ...this,
            start: temp_is_full_day ? tempStart : this.startTimeN,
            end: temp_is_full_day ? new Date(tempEnd!.setHours(23,59,0)) : this.endTimeN,
            total_hour: tempTotalHour,
            is_full_day: temp_is_full_day,
            user_id: this.user?.id,
            absence_type_id: this.absenceType?.id,
            approved_by: this.approvedBy?.id,
            absenceType: undefined,
            user: undefined,
            approvedBy: undefined,
            startDate: undefined,
            startTime: undefined,
            endDate: undefined,
            endTime: undefined,
            modificationDate: undefined,
            approvalDate: undefined,
            approvalTime: undefined,
            isDetailsModal: undefined,
            pageName: undefined,
            isNewRequestModal: undefined,
            timeDivisionValue : undefined,
            totalHourDependentValue: undefined,
            date:undefined,
            startTimeN: undefined,
            endTimeN:undefined,
            startMin: undefined,
            startMax: undefined,
            endMin: undefined,
            endMax: undefined,
            requestCreatedTime: undefined
        }

    }
    
    checkOneday(data:AbsenceRequest){
        console.log(data.isDetailsModal);
        if(!data.isDetailsModal){
            if(!data.is_full_day){
                if(data.total_hour >= 8){
                    this.is_full_day = true;
                    this.start = new Date(this.startTimeN!.setHours(0,0,0))
                    this.end = this.endTimeN
                    this.total_hour = 1;
                }
            }
            
        }
        
    }
    convToFormat(date: Date, type: String) {

        switch (type) {
            case "DATE":
                return new Date(date).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }).replace(/\//g, '.')
                break;
            case "TIME":
                return new Date(date).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                });
                break;
        }
        return "";
    }
    getTimeDifference(): any {
        
        
        this.startTimeN?.setDate(this.date.getDate()) 
        this.startTimeN?.setMonth(this.date.getMonth()) 
        this.startTimeN?.setFullYear(this.date.getFullYear()) 
        this.startTimeN?.setSeconds(0);
        
        this.endTimeN?.setDate(this.date.getDate()) 
        this.endTimeN?.setMonth(this.date.getMonth()) 
        this.endTimeN?.setFullYear(this.date.getFullYear()) 
        this.endTimeN?.setSeconds(0);
        
        const startDateTime = this.is_full_day ? this.start : this.startTimeN;        
        const endDateTime =  this.is_full_day ?  (this.end ? new Date(this.end!.setHours(23,59,0)) : undefined) : this.endTimeN;
         if (!startDateTime || !endDateTime) {
            return;
        }
        const timeDifferenceInMilliseconds = endDateTime?.getTime() - startDateTime?.getTime();
        const timeDifferenceInHours = parseFloat((timeDifferenceInMilliseconds / this.timeDivisionValue).toFixed(2));

        if (!this.is_full_day) {
            this.total_hour = timeDifferenceInHours;

        } else{
            let timeDifferenceInDays = Math.ceil(timeDifferenceInHours / 24);
            this.total_hour = timeDifferenceInDays;
        }
        return this.total_hour || 0  
    }
    
    totalHourChecking(dataItem:any, isPopup = false){
        let totalhours = dataItem.total_hour || 0;
        const unit = dataItem.is_full_day ? $localize ` days` : $localize ` hrs`;
        return !isPopup ?  `${totalhours} ${unit}` :   totalhours ;
	}
}

