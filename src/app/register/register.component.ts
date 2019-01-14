import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';
import {AuthService,FacebookLoginProvider, GoogleLoginProvider} from 'angular-6-social-login';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    user:any={};emailPattern;mismatch: boolean;first_name;last_name;email;password;confpass;
    constructor(private route: Router, private loginService: LoginService,private socialAuthService: AuthService) { }

    ngOnInit() {
        this.mismatch = false;
    }

    public socialSignIn(socialPlatform : string) {
        let socialPlatformProvider;
        if(socialPlatform == "facebook"){
            socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
        }else if(socialPlatform == "google"){
            socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
        } 
        
        this.socialAuthService.signIn(socialPlatformProvider).then((userData) => {
            console.log(socialPlatform+" sign in data : " , JSON.stringify(userData));
        	this.loginService.socialLogin(userData)
        });
    }

    checkPassword(p,c) {
        if(p == c) {
          return  this.mismatch = false;
        }
        else {
          return this.mismatch = true;
        }
    }

    signUp(data){
        this.loginService.signup(data.first_name, data.last_name, data.email, data.confPass, 4)
    }
}
