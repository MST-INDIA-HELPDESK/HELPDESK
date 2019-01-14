import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';
import { AuthService,FacebookLoginProvider, GoogleLoginProvider } from 'angular-6-social-login';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
	userWindow:boolean;login:boolean;signup:boolean;
	user:any={};emailPattern;loggedIn;
	constructor(private route: Router, private loginService: LoginService,private socialAuthService: AuthService) { 
		this.login = true;
		this.signup = false;
		this.emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
	}

	ngOnInit() {
		localStorage.getItem('email');
		localStorage.getItem('password');
		this.user={email:localStorage.getItem('email'),password:localStorage.getItem('password')}
	}
  	/*** Social Login ***/
  	public socialSignIn(socialPlatform : string) {
	    let socialPlatformProvider;
		if(socialPlatform == "facebook"){
			socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
		}else if(socialPlatform == "google"){
			socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
		} 
		
		this.socialAuthService.signIn(socialPlatformProvider).then((userData) => {
			this.loginService.socialLogin(userData)
		});
	}

  	/*** Regular Login ***/
  	signIn(data){
		this.loginService.login(data.email, data.password)
	}
	remember(u){
	    localStorage.setItem('email',u.email);
	    localStorage.setItem('password',u.password);
	}
}
