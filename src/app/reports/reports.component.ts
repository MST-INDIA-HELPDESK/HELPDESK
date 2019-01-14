import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm, AbstractControl } from '@angular/forms';
import {MyDatePicker, IMyOptions, IMyDateModel} from 'mydatepicker';
import {IMyDpOptions} from 'mydatepicker';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
	myDatePickerOptions;date;
	run_rpt;result:boolean=false;empty:boolean;
	fromdate="";todate="";
	report_type:any=[];report_types;
	rptData:any=[];
	rpt_type = ["Tickets per user","Tickets per category"];

	constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {
		this.date="";
		this.myDatePickerOptions={
		dateFormat: 'yyyy-mm-dd',
		allowDeselectDate:true,
		openSelectorOnInputClick:true}
	}

	ngOnInit() {
		this.report_types='run_rpt';
		this.rptData=[];
  	}
  	
  	agentReport(data,type){
  		if(type=="agent"){
		this.http.post("https://www.shopemailer.com/api/rptPerUser",{fromdt:data.fromdate.formatted, todt:data.todate.formatted}).subscribe(data => {
			this.rptData = data;
			this.result=true;
			if(this.rptData.length==0){
				this.empty=true;
			}else{
				this.empty=false;
			}
		});
  		}else{
  		this.http.post("https://www.shopemailer.com/api/rptPerCategory",{fromdt:data.fromdate.formatted, todt:data.todate.formatted}).subscribe(data => {
			this.rptData = data;
			this.result=true;
			if(this.rptData.length==0){
				this.empty=true;
			}else{
				this.empty=false;
			}
		});
  		}
	}
	custSatisfication(data){
	this.http.post("https://www.shopemailer.com/api/rptCustomer",{fromdt:data.cust_from_date.formatted, todt:data.cust_to_date.formatted}).subscribe(data =>{
			this.rptData = data;
			this.result=true;
			if(this.rptData.length==0){
				this.empty=true;
			}else{
				this.empty=false;
			}
	});
	}
	
	runReport(data){
		this.http.post("https://www.shopemailer.com/api/rptRun",{fromdt:data.from_date.formatted, todt:data.to_date.formatted}).subscribe(data => {
			this.rptData = data;
			this.result=true;
			if(this.rptData.length==0){
				this.empty=true;
			}else{
				this.empty=false;
			}
		});
	}

}
