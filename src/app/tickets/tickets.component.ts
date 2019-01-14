import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {MyDatePicker, IMyOptions, IMyDateModel} from 'mydatepicker';
import { LoginService } from '../services/login/login.service';
import { ToastService } from '../services/toast/toast.service';
import { NotifyService } from '../services/notify/notify.service';
import { FileUploadService } from '../services/fileUpload/file-upload.service';
import {IMyDpOptions} from 'mydatepicker';
import { Router } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {
	@ViewChild("fileUpload") fileInputVariable: any;
	@ViewChild("usersub") usersub: ElementRef;
	@ViewChild('addAssignee') addAssinee: ElementRef;
	@ViewChild('createTicket') createTicket: ElementRef;
	@ViewChild('newTicketId') newTicketId: ElementRef;
	user_type_id;myDatePickerOptions;statusArr:any=[];createdDate;all:any=[];allSelect;multiSelect:boolean;
  	priorities:any=[]; status; agents:any=[];ticketStatus:any=[]; data:any=[];loggedIn;tags:any=[];p;
  	tickets:any=[];Open;Closed;Resolved;selectedTeam:any=[]; teams:any=[]; param:any=[];date;
	_opened: boolean = false;selectedPriority:any=[];selectedStatus:any=[];multidAgent;selectedTag=[];
	selectedAgent:any=[];defalutPic;profile_photo;user_id;user:any=[];topics;ticketId;catid;selectedCategory:any;
	uploadData;selectedFile: File = null;firstnm;lastnm;uticketemail;usersubject;usermessage;

  	constructor(private http: HttpClient,private loginService: LoginService,private toastService:ToastService,
  	private route:Router,private notifyService:NotifyService, private fileUploadService: FileUploadService) {
		this.defalutPic="assets/images/profile-img.jpg";
		this._opened=false; this.date="";
		this.myDatePickerOptions={
		dateFormat: 'yyyy-mm-dd',
		allowDeselectDate:true,
		openSelectorOnInputClick:true}
		this.selectedStatus=[1];
		this.selectedCategory=1;
  	}

  	ngOnInit() {
  		this.user_type_id=localStorage.getItem('user_type_id');
  		this.user_id=localStorage.getItem('user_id');
		this.Open="Open"; this.Closed="Closed";this.Resolved="Resolved";
		this.loggedIn = this.loginService.isLoggedIn();
		this.http.get("https://www.shopemailer.com/api/getTopics").subscribe(data => {
		    this.topics=data;
		});
		this.http.get("https://www.shopemailer.com/api/getUserProfile").subscribe(data => {  
			this.user = data;
		}); 
  		this.getTickets();
	  	this.http.get("https://www.shopemailer.com/api/getPriorities").subscribe(data => {
	      this.priorities = data;
	    },err=>{
	    	//alert('Err')
	    });
	    this.http.get("https://www.shopemailer.com/api/getProfilePic").subscribe(data => {
			if(data){
		    	this.profile_photo = data[0].profile_pic;
			}
	    });
         this.http.get("https://www.shopemailer.com/api/getTags").subscribe(data => {
		      this.tags = data;
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
	}
	
	reset() {
		this.firstnm = '';
		this.lastnm = '';
		this.uticketemail = '';
		this.usersubject = '';
		this.usermessage = '';
	}
  	
  	getTickets(){
  		var url="";
  		if(this.user_type_id ==2){
  			url="https://www.shopemailer.com/api/getTickets?user_type_id="+this.user_type_id
   		}else{
  			 url="https://www.shopemailer.com/api/getTickets"
  		}
  		this.http.get(url).subscribe(data => {
      	this.tickets = data;
 	    },err=>{
	    	//alert('Err')
	    });
    }
	  
    newTicket(data) {
		if(data.selectedCategory) {
			let curDate = new Date();
			let createdDate = curDate.getFullYear() +"-"+(((curDate.getMonth()+1) < 10)?"0":"") + (curDate.getMonth()+1) +"-"+ ((curDate.getDate() < 10)?"0":"") + curDate.getDate() + " " + ((curDate.getHours() < 10)?"0":"") + curDate.getHours() +":"+ ((curDate.getMinutes() < 10)?"0":"") + curDate.getMinutes() +":"+ ((curDate.getSeconds() < 10)?"0":"") + curDate.getSeconds();
			this.selectedFile = this.fileInputVariable.nativeElement.files[0];
			if(typeof this.selectedFile !== 'undefined') {
				let file: File = this.selectedFile;
				let formData: FormData = new FormData();
				formData.append('image', file, this.selectedFile.name);
				this.fileUploadService.fileUpload(formData).subscribe(res =>{
					if(res[0].result == 'success') {
						this.http.post("https://www.shopemailer.com/api/genTickets",{fnm: data.firstnm, lnm: data.lastnm, email: data.uticketemail, subject: data.usersubject, message: data.usermessage, createdDate: data.createdDate, updatedDate: data.createdDate, prio: 'Medium', status: 1, topic: data.selectedCategory, attached_file:res[1].file_name}).subscribe(data => {  
							this.ticketId = data;
							$(this.createTicket.nativeElement).modal('hide');
							this.reset(); 
							$(this.newTicketId.nativeElement).modal('show'); 
							this.getTickets();
						}); 
					}
					else {
						this.toastService.showError('Server Error ... ')
					}
				});
			}
			else {
					this.http.post("https://www.shopemailer.com/api/genTickets",{fnm: data.firstnm, lnm: data.lastnm, email: data.uticketemail, subject: data.usersubject, message: data.usermessage, createdDate: createdDate, updatedDate: createdDate, prio: 'Medium', status: 1, topic: data.selectedCategory,attached_file: null}).subscribe(data => {  
					this.ticketId = data;
					$(this.createTicket.nativeElement).modal('hide');
					this.reset();
					$(this.newTicketId.nativeElement).modal('show'); 
					this.getTickets();
				}); 
			}
		}
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
	deleteTicket(){
		this.http.post("https://www.shopemailer.com/api/deleteTicket",{data:this.all}).subscribe(data => {
	      this.tickets=data;
	      this.toastService.showSuccess('Deleted Successfully')
	    },err=>{
		    this.toastService.showError('Connection Error ')
	    });
	    this.all=[];
	} 
	assignTicket(assignee){
		this.http.post("https://www.shopemailer.com/api/assignTicket",{data:this.all,assignee:assignee}).subscribe(data => {
    		this.tickets=data;
      		this.all=[];
			$(this.addAssinee.nativeElement).modal("hide");
			 this.toastService.showSuccess('Assignee assigned Successfully')
	    },err=>{
		    this.toastService.showError('Connection Error ')
	    });
	}
	update(val,type,ticket_id,target_id){
		console.log('ticket_id :'+ticket_id+' target_id :'+ target_id+" value :"+val+" type "+type)
		if(type=="status"){
			this.data={user_id:this.user_id,target_id:target_id,ticket_id:ticket_id,type:type,status:val}
			if(this.user_id==target_id){
				console.log("self assignment")
			}else{
				this.notifyService.notify(this.data).subscribe(res =>{})
			}
		}
		else if(type=="priority"){
			this.data={user_id:this.user_id,target_id:target_id,ticket_id:ticket_id,type:type,priority:val}
			if(this.user_id==target_id){
				console.log("self assignment")
			}else{
			this.notifyService.notify(this.data).subscribe(res =>{})
			}
		}else{
			this.data={user_id:this.user_id,target_id:target_id,ticket_id:ticket_id,type:type,assignee:val}
			if(this.user_id==target_id){
				console.log("self assignment")
			}else{
				this.notifyService.notify(this.data).subscribe(res =>{})
			}
		}
		this.http.post("https://www.shopemailer.com/api/updateTicket",{data:this.data}).subscribe(data => {
	       this.toastService.showSuccess(type.slice(0,1).toUpperCase()+type.slice(1) +' Updated')
	    },err=>{
		   this.toastService.showError('Error updating ' + type.toUpperCase() )
	    });
	}
  	filter(p,type){
  		if(type=='date'){
  			this.createdDate=p.formatted;
			if(this.createdDate=="" && this.selectedTag==[] && this.selectedPriority==""  && this.selectedStatus=="" && this.selectedTeam==[] && this.selectedAgent==""){
				this.getTickets();
			}
			this.date=p.formatted;
		}
		this.param={'user_type_id':this.user_type_id,'priority':this.selectedPriority,'status':this.selectedStatus,'tag':this.selectedTag,'team':this.selectedTeam,'assignee':this.selectedAgent,'date':this.date}
		this.http.post("https://www.shopemailer.com/api/filterTickets",{param:this.param}).subscribe(data => {
	      	this.tickets = data;
  	    },err=>{
		    	//alert('Err')
	    });
  	}
 }

