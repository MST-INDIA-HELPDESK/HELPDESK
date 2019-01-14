import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm, AbstractControl } from '@angular/forms';
import { ToastService } from '../services/toast/toast.service';

@Component({
  selector: 'app-sla-policies-settings',
  templateUrl: './sla-policies-settings.component.html',
  styleUrls: ['./sla-policies-settings.component.css']
})
export class SlaPoliciesSettingsComponent implements OnInit {
	openform=false;
	overdue_alerts: boolean = false;edit:boolean;
	SLApolicy;
	name; grace_period;status;notes;
	typeid; sid;
	
	constructor(private http: HttpClient, private toastService:ToastService) {}

	ngOnInit() {
		var type_id=localStorage.getItem('user_type_id');
		if(type_id=='1'){
			 this.typeid = true;
		}
		this.getSLApolicies();
	}
	reset(){
		this.edit=false;
		this.name = '';
		this.grace_period = '';
		this.status = '';
		this.notes = '';
	}
	onClickOpenForm(){
		this.openform=true;
		this.reset();
	}
	saveSLApolicy(name, grace_period, status, overdue_alerts, notes){
		this.http.post("https://www.shopemailer.com/api/saveSLApolicy", {nm:name, grace_prd: grace_period, status:status, overdue_alerts:overdue_alerts, notes:notes}).subscribe(data=>{
			this.toastService.showSuccess('SLA Policy saved')
		});
		this.getSLApolicies();
		this.edit=true;
		this.openform=false;
	}
	
	getSLApolicies(){
		this.http.get("https://www.shopemailer.com/api/getSLApolicies").subscribe(data=>{
			this.SLApolicy = data;
		});
		
	}
	
	editSLAPolicy(id){
		this.openform=true;
		
		this.http.post("https://www.shopemailer.com/api/getSLApoliciesById", {sid: id}).subscribe(data => {
			this.edit=true;
			if(data){
        	this.name = data[0].name;
        	this.grace_period = data[0].grace_period;
        	this.status = data[0].status;
        	this.overdue_alerts = data[0].ticket_overdue_alerts;
        	this.notes = data[0].notes;
        	this.sid = data[0].id;
			}
    	});
	}
	
	updateSLAPolicy(sid, name, grace_period, status, overdue_alerts, notes){
		this.http.post("https://www.shopemailer.com/api/updateSLAPolicy", {sid:sid, nm:name, grace_prd: grace_period, status:status, overdue_alerts:overdue_alerts, notes:notes}).subscribe(data=>{
			this.toastService.showSuccess('SLA Policy updated')
		});
		this.openform=false;
		this.getSLApolicies();
	}
	
	delSLAPolicy(id){
		if(id) {
	      this.http.post("https://www.shopemailer.com/api/delSLAPolicy", {sid: id}).subscribe(data => {
	      	this.SLApolicy = data;
	      	this.toastService.showSuccess('SLA Policy deleted')
	      });
	    }
	}
}
