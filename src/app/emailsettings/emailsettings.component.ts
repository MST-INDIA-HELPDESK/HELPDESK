import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm, AbstractControl } from '@angular/forms';
import { ToastService } from '../services/toast/toast.service';
declare var $: any;

@Component({
  selector: 'app-emailsettings',
  templateUrl: './emailsettings.component.html',
  styleUrls: ['./emailsettings.component.css']
})
export class EmailsettingsComponent implements OnInit {
	openform=false;openupdateform=false;range;
	Settingsemails;eid;updateemail;email;content='';
	chknewemail:boolean;chkbannedemail:boolean;edit:boolean;
	public show:boolean = false;
	newemail;bannedemail;
	email_templates;     
	EmailGenSettings;header_spoofing: boolean = false;
	default_temp;defaultSysEmail;defaultAlertEmail;adminemail;hostname;portno;secure;Authentication;encryption;
	temp_name;temp_status;
	typeid;
	
	caretPos: number = 0;
	eTitle = "This is subject";
	logoImage = 'assets/images/profile-img.jpg';
	shopName = 'mstindia';
	constructor(private http: HttpClient, private toastService:ToastService) { this.content =""; }

	ngOnInit() {
		var type_id=localStorage.getItem('user_type_id');
		if(type_id=='1'){
			 this.typeid = true;
		}
		
	   	this.getEmailAddr();
	   	this.getEmailTemp();
	   	
	   	this.http.get("http://192.168.0.10:8091/api/getEmailGenSettings").subscribe(data => {
	      	this.EmailGenSettings = data;
	      	 
	      	if(data !=""){
	      	this.edit=true;
	      	
        	this.default_temp = data[0].template_set;
        	this.defaultSysEmail = data[0].system_email;
        	this.defaultAlertEmail = data[0].alert_email;
        	this.adminemail = data[0].admin_email;
        	this.hostname = data[0].hostname;
        	this.portno = data[0].port_no;
        	this.secure = data[0].secure;
        	this.Authentication = data[0].authentication;
        	this.encryption = data[0].encryption;
        	this.header_spoofing = data[0].header_spoofing;
			}
			else{
				this.edit=false;
			}
	    });
	   	
			/*this.content = `<html>
						<head>
						<title></title>
						</head>
						<body>
						<p style="text-align: center;"><img src="${this.logoImage}" height="100px" width="100px"></p>
						<p style="text-align: right;">Date: </p>
						<h5 style="text-align: center;">Subject: ${this.eTitle}</h5><br>
						<div style="text-align: left;">Dear Customer,<br>
						You asked us to email you when is available in stock. We are pleased to inform you that it has arrived!<br>
						But please complete your purchase as soon as possible.<br><br></div>
						<p>Thank you for choosing ${this.shopName}.</p>
						</body>
					</html>`;	*/
	}
	
	toggle() {
    	this.show = !this.show;
	}
	
	reset(){
		this.email = '';
		this.edit=false;
		this.temp_name = '';
		this.temp_status = '';
		this.content = '';
	}
	
	getCaretPos(oField) {
	    /*var element = document.getElementById("editor");
	    var caretOffset = 0;
        if (document.createRange) {     
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;*/
        //console.log('caretPos:'+caretOffset)
        if(this.content){
        this.caretPos= this.content.length;
        }
      }
	
	addTag(tag){
	   var addTag='{{'+tag +'}}';
		this.content = this.content.substr(0, this.caretPos) + " " + addTag + this.content.substr(this.caretPos);
		//console.log("content : "+this.content)
	}
	getEmailAddr(){
		this.http.post("http://192.168.0.10:8091/api/getSettingsemails", {}).subscribe(data=>{
			this.Settingsemails = data;
		});	
	}
	
	getData(str){
		if(str=='chkbannedemail'){
			this.chkbannedemail=true;
			this.chknewemail=false;
		}
		if(str=='chknewemail'){
			this.chknewemail=true;
			this.chkbannedemail=false;
		}
		this.http.post("http://192.168.0.10:8091/api/getSettingsemails",{param:str}).subscribe(data=>{
        	this.Settingsemails = data;
		});	
	}
	
	onClickOpenForm(){
		this.openform=true;
		this.reset();
	}
	onClickCloseForm(){
		this.openform=false;  
	}
	onClickOpenUpdateForm(){
		this.openupdateform=true;
	}
	onTabChange(){
		this.openform=false;
		this.edit=false;
	}
	
	saveOrBanEmailAddr(email, status){
		if(status=="new") {
			this.http.post("http://192.168.0.10:8091/api/saveOrBanEmailAddr",{ email:email, status:0}).subscribe(data => {
				if(data == 'email Exist') {
			        this.toastService.showWarning('Email already exist')
			    }
			    else {
			    	this.toastService.showSuccess('New email added')
			    }
			});
			
		}
		else {
			this.http.post("http://192.168.0.10:8091/api/saveOrBanEmailAddr",{ email:email, status:1}).subscribe(data => {
				if(data == 'email Exist') {
					this.toastService.showWarning('Email already exist')
			    }
			    else {
				    	this.toastService.showSuccess('New email added')
			    }
			});
		}
	}
	editnewOrBannedEmail(id, status){
		this.openform=true;
		
		this.http.post("http://192.168.0.10:8091/api/getSettingEmailById", {eid: id, param:status}).subscribe(data => {
			this.edit=true;
			if(data){
        	this.email = data[0].email;
        	this.eid = data[0].id;
			}
    	});
	}
	updateNewOrBanEmailAddr(email, eid, status){
		this.http.post("http://192.168.0.10:8091/api/updateSettingEmailById", {eid:eid, email:email, param:status}).subscribe(data => {
			this.toastService.showSuccess('Email updated')
		});
		
	}
	
	delnewOrBannedEmail(id, status){
	    if(id) {
	      this.http.post("http://192.168.0.10:8091/api/delnewOrBannedEmail", {emailid: id, param:status}).subscribe(data => {
	      	this.Settingsemails = data;
	      	this.toastService.showSuccess('Email deleted')
	      });
	    }
	}
	
	getEmailTemp(){
		this.http.get("http://192.168.0.10:8091/api/getemail_templates").subscribe(data=>{
	   		if(data){
	    		this.temp_name = data[0].name;
	    		this.temp_status = data[0].status;
	    		this.content = data[0].content;
			}
			this.email_templates = data;
		});
	}
	
	saveNewEmailTemp(temp_name, temp_status, content){
		this.http.post("http://192.168.0.10:8091/api/saveNewEmailTemp",{ temp_name:temp_name, temp_status:temp_status, content:content}).subscribe(data => {
			this.toastService.showSuccess('Template Added')
		});
	}
	
	editEmailTemp(id){
		this.openform=true;
		console.log("id : "+id);
		this.http.post("http://192.168.0.10:8091/api/getEmailTempById", {eid: id}).subscribe(data => {
			this.edit=true;
			if(data){
	        	this.temp_name = data[0].name;
	        	this.temp_status = data[0].status;
	        	this.content = data[0].content;
	        	this.eid = data[0].id;
			}
    	});
	}
	
	updateEmailTemp(eid, temp_name, temp_status, content){
		this.http.post("http://192.168.0.10:8091/api/updateEmailTemp",{eid: eid, temp_name:temp_name, temp_status:temp_status, content:content}).subscribe(data => {
			this.toastService.showSuccess('Template Updated')
		});
	}
	
	delEmailTemp(id){
	    if(id) {
	      this.http.post("http://192.168.0.10:8091/api/delEmailTemp", {tid: id}).subscribe(data => {
	      	this.email_templates = data;
	      	this.toastService.showSuccess('Template deleted')
	      });
	    }
	}
	
	saveEmailGenSettings(default_temp, defaultSysEmail, defaultAlertEmail, adminemail, hostname, portno, secure, Authentication, encryption, header_spoofing){
		this.http.post("http://192.168.0.10:8091/api/saveEmailGenSettings", {temp_set: default_temp, sys_email:defaultSysEmail, alert_email:defaultAlertEmail, admin_email:adminemail, hostname:hostname, port_no:portno, secure:secure, auth:Authentication, encryption:encryption, header_spoofing:header_spoofing}).subscribe(data => {
	      	this.EmailGenSettings = data;
	      	this.toastService.showSuccess('Settings Saved')
	    });
	    this.edit=true;
	}
	
	updateEmailGenSettings(default_temp, defaultSysEmail, defaultAlertEmail, adminemail, hostname, portno, secure, Authentication, encryption, header_spoofing){
		 this.http.post("http://192.168.0.10:8091/api/updateEmailGenSettings", {temp_set: default_temp, sys_email:defaultSysEmail, alert_email:defaultAlertEmail, admin_email:adminemail, hostname:hostname, port_no:portno, secure:secure, auth:Authentication, encryption:encryption, header_spoofing:header_spoofing}).subscribe(data => {
	      	this.EmailGenSettings = data;
	      	this.toastService.showSuccess('Settings Updated')
	    });
	    this.edit=true;
	}
}
