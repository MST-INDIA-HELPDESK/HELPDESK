import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../services/login/login.service';
import { ToastService } from '../services/toast/toast.service';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css']
})
export class UserHeaderComponent implements OnInit {
	user_id;user_name; profile_pic; open:boolean;loggedIn;
	public show:boolean = false;
	constructor(private http:HttpClient,private loginService:LoginService,private toast:ToastService) { }

	ngOnInit() {
		this.user_id=localStorage.getItem('user_id')
		this.loggedIn = this.loginService.isLoggedIn();
		console.log(this.loggedIn)
		if(this.loggedIn == true) {
			this.http.get("https://www.shopemailer.com/api/getUser").subscribe(res=>{
				if(res){
					this.show = true;
					this.profile_pic=res[0].profile_pic;
					this.user_name=res[0].user_name;
				}
			},err=>{
				console.log(err)
			});
		}
	}
	
	logout(){
		this.loginService.logout();
	}
}
