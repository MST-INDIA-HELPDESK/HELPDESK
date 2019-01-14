import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../services/toast/toast.service';

@Component({
  selector: 'app-forgetpassword',
  templateUrl: './forgetpassword.component.html',
  styleUrls: ['./forgetpassword.component.css']
})
export class ForgetpasswordComponent implements OnInit {
	email;
	constructor(private http: HttpClient,private toastService:ToastService) { }
	
	ngOnInit() {
	
	}
	resetPass(form){
		console.log(form.email);
		this.http.post("https://www.shopemailer.com/api/resetPass",{email:form.email}).subscribe(data => {
	      ///this.tickets=data;
	      this.toastService.showSuccess('Password sent to your email')
	    },err=>{
		    this.toastService.showError('Connection Error ')
		});
	}
	
}
