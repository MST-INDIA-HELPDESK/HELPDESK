import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from '../toast/toast.service';
import * as moment from "moment";

@Injectable({
    providedIn:'root'
})
export class LoginService {

searchdata;
constructor(private http: HttpClient,private route:Router,private toastService:ToastService) { }
   login(email, password) {
   	    this.http.post('https://www.shopemailer.com/api/login', {email: email, password: password }).subscribe((res:any) => {
           if (res.token) {
   				localStorage.setItem('user_id',res.id);
   				localStorage.setItem('user_type_id',res.type_id);
   				var obj={email:email, token:res.token, expiresIn:res.expiresIn}
				this.setSession(obj)
				 localStorage.setItem('access_token',obj.token);
				 /*
			 	if(res.type_id==4){
	 				this.route.navigate(['home']);
			 	}else{
					 */
					 this.route.navigate(['dashboard']);
					 /*
				 }
				 */
            }else{
            	this.toastService.showError('Invalid login credentials')
            }
        });
    }
 
 	signup(fnm,lnm,email,password,utype){
		let currentUrl = this.route.url;
		this.http.post('https://www.shopemailer.com/api/signup', {fNm: fnm, lNm: lnm, email: email, password: password, utype:utype,type:'regular'})
        .subscribe((res:any) => {
			if (res.token) {
				var obj={email:email, token:res.token, expiresIn:res.expiresIn};
				this.setSession(obj);
				localStorage.setItem('access_token',obj.token);
				if(currentUrl == '/register')
				{
					this.route.navigate(['login']);
					this.toastService.showSuccess('Account is created successfully')
				}
				if(currentUrl == '/dashboard/user')
				{
					this.toastService.showSuccess('Account is created successfully and Password sent to your email');
				}	
			}else{
				this.toastService.showWarning('User already exist')
				if(currentUrl == '/register')
				{
					this.route.navigate(['login']);
				}	
			}
        });
	}
	socialLogin(user){
	    var full_name = user.name;
	    var first_name = full_name.split(' ').slice(0, -1).join(' ');
        var last_name = full_name.split(' ').slice(-1).join(' ');
		this.http.post('https://www.shopemailer.com/api/signup', {fNm: first_name, lNm: last_name, email: user.email, password: 'social', utype:4,image:user.image,type:'social'})
        .subscribe((res:any) => {
			if (res.token) {
				localStorage.setItem('user_id',res.id);
			    localStorage.setItem('user_type_id', '4');
				var obj={email:user.email, token:res.token, expiresIn:res.expiresIn};
				this.setSession(obj);
				localStorage.setItem('access_token',obj.token);
				this.route.navigate(['dashboard']);
            }
			else {
			    localStorage.setItem('user_id',res.id);
			    this.route.navigate(['dashboard']);
			}
        });
	}
	 
  	setSession(authResult) {
		const expiresAt = moment().add(authResult.expiresIn,'second');
		localStorage.setItem('id_token', authResult.token);
        localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()) );
    }          

    logout() {
        localStorage.removeItem('user_id');
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('user_type_id');
        localStorage.removeItem('access_token');
        this.route.navigate(['login'])
    }

    isLoggedIn() {
    	 var exp=moment().isBefore(this.getExpiration());
    	 if(exp==false){
    		localStorage.removeItem('access_token');
    	 }
	     return moment().isBefore(this.getExpiration());
    }

    isLoggedOut() {
        return !this.isLoggedIn();
    }

    getExpiration() {
        const expiration = localStorage.getItem("expires_at");
        const expiresAt = JSON.parse(expiration);
        return moment(expiresAt);
    }    
	setData(items){
		this.searchdata = items;
	}
	getData(){
		return this.searchdata;
	}
}