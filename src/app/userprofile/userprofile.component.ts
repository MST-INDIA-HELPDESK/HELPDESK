import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import {MyDatePicker, IMyOptions, IMyDateModel} from 'mydatepicker';
import { ToastService } from '../services/toast/toast.service';
import { NotifyService } from '../services/notify/notify.service';
import {IMyDpOptions} from 'mydatepicker';
declare var $: any; 

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.css']
})
export class UserprofileComponent implements OnInit {
	profile_id;UserData;Open;Closed;Resolved;priorities;profile_photo;agents;user_id;p;
	ticketStatus;teams;tickets;multiSelect:boolean;all;allSelect;data;opencount:any=[];closedcount:any=[];resolvedcount:any=[];
	opencnt;closedcnt;resolvedcnt;createdDate;user_type_id;selectedTeam:any=[]; param:any=[];date;
	_opened: boolean = false;selectedPriority:any=[];selectedStatus:any=[];
	selectedAgent:any=[];myDatePickerOptions;selectedCategory:any;

	url = 'assets/images/profile-img.jpg';
	constructor(private router: Router,private route: ActivatedRoute,private http: HttpClient,
	private toastService:ToastService,private notifyService:NotifyService) {
	    this.date="";
		this.myDatePickerOptions={
		dateFormat: 'yyyy-mm-dd',
		allowDeselectDate:true,
		openSelectorOnInputClick:true}
		this.selectedStatus=[1];
		this.selectedCategory=1;
		
	}

	ngOnInit() {
  	this.route.params.subscribe( params => {
      this.profile_id = params.user_id
    });
    this.user_id=localStorage.getItem('user_id');
    this.user_type_id=localStorage.getItem('user_type_id');
    this.http.post("https://www.shopemailer.com/api/editUsers",{usrid:this.profile_id}).subscribe(data=>{
		this.UserData=data;
    });	
    
    this.Open="Open"; this.Closed="Closed";this.Resolved="Resolved";
  		
  		this.getTickets();
	  	this.http.get("https://www.shopemailer.com/api/getPriorities").subscribe(data => {
	      this.priorities = data;
	    },err=>{
	    	//alert('Err')
	    });
	    this.http.get("https://www.shopemailer.com/api/getProfilePic").subscribe(data => {
				if(data)
		    	this.profile_photo = data[0].profile_pic;
		    },err=>{
		    	//alert('Err')
	    });
    
	    this.http.get("https://www.shopemailer.com/api/getAgents").subscribe(data => {
	      this.agents = data;
 	    },err=>{
	    	//alert('Err')
	    });
	    this.http.get("https://www.shopemailer.com/api/getTicketStatus").subscribe(data => {
	      this.ticketStatus = data;
	    },err=>{
	    	//alert('Err')
	    });
	    
      	this.http.get("https://www.shopemailer.com/api/getTeams").subscribe(data => {
      	this.teams = data;
	    },err=>{
	    	//alert('Err')
	    });
  }
  
	_toggleSidebar() {
    	this._opened = !this._opened;
    	console.log(this._opened)
  	}
  	
  	update(val,type,ticket_id,target_id){
		if(type=="status"){
			this.data={user_id:this.user_id,target_id:target_id,ticket_id:ticket_id,type:type,status:val}
			if(this.user_id==target_id){
				console.log("false")
			}else{
				this.notifyService.notify(this.data).subscribe(res =>{
				console.log("user notified")
				})
			}
		}
		else if(type=="priority"){
			this.data={user_id:this.user_id,target_id:target_id,ticket_id:ticket_id,type:type,priority:val}
			if(this.user_id==target_id){
				return false
			}else{
			this.notifyService.notify(this.data).subscribe(res =>{
				console.log("user notified")
			})
			}
		}else{
			this.data={user_id:this.user_id,target_id:target_id,ticket_id:ticket_id,type:type,assignee:val}
			if(this.user_id==target_id){
				console.log("false")
			}else{
			this.notifyService.notify(this.data).subscribe(res =>{
				console.log("user notified")
			})
			}
		}
		this.http.post("https://www.shopemailer.com/api/updateTicket",{data:this.data}).subscribe(data => {
	       this.toastService.showSuccess(type.slice(0,1).toUpperCase()+type.slice(1) +' Updated')
	    },err=>{
		   this.toastService.showError('Error updating ' + type.toUpperCase() )
	    });
	}
  	
  	getTickets(){
  	    
  		this.http.post("https://www.shopemailer.com/api/getMyTickets",{usr_id:this.profile_id,selectedStatus:this.selectedStatus}).subscribe(data => {
  		this.tickets = data;
  		//this.opencount,this.closedcount,this.resolvedcount =0;
  	//	console.log(""+JSON.stringify(data));
  		for(var i=0;i<this.tickets.length;i++)
  		{
  			//console.log(""+JSON.stringify(this.tickets[i].status));
  			if(this.tickets[i].status==1)
  			{
  				this.opencount.push(this.tickets[i].user_id);		
  			//	console.log("opencount= "+this.opencount);
  			}
  			else if(this.tickets[i].status==2)
  			{
  				this.closedcount.push(this.tickets[i].user_id);
  			//	console.log("closedcount= "+this.closedcount);
  			}
  			else{
  				this.resolvedcount.push(this.tickets[i].user_id);
  			//	console.log("resolvedcount= "+this.resolvedcount);
  			} 
  		} 
	    this.opencnt=this.opencount.length;
	    this.closedcnt=this.closedcount.length;
	    this.resolvedcnt=this.resolvedcount.length;
	    
 	    },err=>{
	    	//alert('Err')
	    });
  	}
  	
  	selectAll(ev) {
  		this.tickets.forEach(x => x.selected = ev.target.checked)
  		this.multiSelect=true;
  		if(ev.target.checked==true){
	  		for (var i = 0; i < this.tickets.length; i++) {
	      		this.all.push(this.tickets[i].id);
	    	}
  		}else{
  			this.all=[];
  			this.multiSelect=false;
  		}
  	}
	
  	checkIfAllSelected(ev,i) {
  		this.multiSelect=true;
		if(ev.target.checked==false){
			this.all.splice(this.all.indexOf(i),1);
			if(this.all==""){
				this.multiSelect=false;
			}
		}else{
				this.all.push(i);
		}
		this.allSelect = this.tickets.every(function(item:any) {
			return item.selected == true;
		})
	}
	
	detail(id){
		this.router.navigate(['dashboard/ticketDetail',id])
	}
	deleteTicket(){
		this.http.post("https://www.shopemailer.com/api/deleteTicket",{data:this.all}).subscribe(data => {
	      this.tickets=data;
	      this.toastService.showSuccess('Deleted Successfully')
	    },err=>{
		    this.toastService.showError('Connection Error ')
	    });
	    this.all=[];
	} 
	filter(p,type){
  		if(type=='date'){
  			this.createdDate=p.formatted;
			if(this.createdDate==""  && this.selectedPriority==""  && this.selectedStatus=="" && this.selectedTeam && this.selectedAgent==""){
				this.getTickets();
			}
			this.date=p.formatted;
		}
		this.param={'user_type_id':this.user_type_id,'priority':this.selectedPriority,'status':this.selectedStatus,'assignee':this.selectedAgent}
		this.http.post("https://www.shopemailer.com/api/myFilterTickets",{param:this.param,prof_id:this.profile_id}).subscribe(data => {
	      	this.tickets = data;
  	    },err=>{
		    	//alert('Err')
	    });
  	}	
}
