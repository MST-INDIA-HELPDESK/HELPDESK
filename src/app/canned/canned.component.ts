import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../services/login/login.service';
import { ToastService } from '../services/toast/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-canned',
  templateUrl: './canned.component.html',
  styleUrls: ['./canned.component.css']
})
export class CannedComponent implements OnInit {
	radioType;edit:boolean;canResponses:any=[];selectedResponse:any=[];message;title;caretPos: number = 0;loggedIn;can_id;
  	constructor(private http: HttpClient,private loginService: LoginService,private toastService:ToastService,private route:Router) { this.message ="";}

  	ngOnInit() {
  		this.loggedIn = this.loginService.isLoggedIn();
    	if(this.loggedIn==false){
			this.route.navigate(['login'])
			this.toastService.showWarning('Session expired..Please login again')
		}
  		this.getResponses();
  	}
  	getCaretPos(oField) {
 	    if (oField.selectionStart || oField.selectionStart == '0') {
	       this.caretPos = oField.selectionStart;
	    }
 	}
	
	getResponses(){
		this.http.get("https://www.shopemailer.com/api/getCannedRes").subscribe(data => {
		      this.canResponses = data;
		    },err=>{
		    	//alert('Err')
	    });
	}
	create(title,message){
		this.http.post("https://www.shopemailer.com/api/createCannedRes",{title:title, mes:message}).subscribe(data => {
			this.getResponses();
			this.reset();
			this.toastService.showSuccess('Response Created Successfully')
		},err=>{
			console.log('Error '+err)
		});
	}
	deleteRes(id){
		this.http.post("https://www.shopemailer.com/api/deleteCannedRes",{id:id}).subscribe(data => {
		      this.getResponses();
		      this.toastService.showSuccess('Response Deleted Successfully')
		    },err=>{
		    	console.log('Error '+err)
	    });
	}
	reset(){
		this.message="";this.title="";
		this.edit=false;
	}
	update(title,message,id){
		this.http.post("https://www.shopemailer.com/api/updateCannedRes",{title:title, mes:message,id:id}).subscribe(data => {
				this.edit=false;
				this.getResponses();
				this.reset();
		      this.toastService.showSuccess('Response Updated Successfully')
		    },err=>{
		    console.log('Error '+err)
	    });
	}

	addTag(tag){
		var addTag='{{'+tag +'}}'
		this.message = [this.message.slice(0, this.caretPos + 1), addTag, this.message.slice(this.caretPos)].join('');
	}
	selectedRes(id){
		this.http.post("https://www.shopemailer.com/api/getSelectedRes",{id:id}).subscribe(data => {
			this.edit=true;
			if(data){
		      this.selectedResponse=data;
		      this.can_id=this.selectedResponse[0].id;
			  this.message=this.selectedResponse[0].message;
			  this.title=this.selectedResponse[0].title;
			}
		    },err=>{
		    	//alert('Err')
	    });
	}
}
