import { Component, OnInit,ViewChild,ElementRef} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../services/login/login.service';
import { ToastService } from '../services/toast/toast.service';
import { Router,ActivatedRoute,NavigationEnd ,Params, PRIMARY_OUTLET} from '@angular/router'
import {Observable} from "rxjs/Observable";
import { SharedService } from '../services/sharedService/shared.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
  
})
export class DashboardComponent implements OnInit {
    @ViewChild('prof') prof:ElementRef;
    @ViewChild('notify') notify:ElementRef;Helpdesk:string="Helpdesk";
 	profile_photo;helpdesk_title;data;logoimage;logourl = 'assets/images/logo.png';url = 'assets/images/profile-img.jpg'; open; loggedIn;notifications:any=[];notificationCount;read:boolean;
 	public show:boolean = false;
	constructor(private http: HttpClient,private loginService:LoginService,private toastService:ToastService,
	private route:Router,private router: ActivatedRoute,private sharedService: SharedService) { 
		
		this.sharedService.imageData.subscribe(
          (data: any) => {
            console.log("my code here :: "+ JSON.stringify(data));
            if(data.logoimage || data.helpdesktitle){
            this.logoimage = data.logoimage;
            this.helpdesk_title = data.helpdesktitle;
            }
            if(data.profileimage){
            this.profile_photo = data.profileimage
            }
          });
		
	}
	
    ngOnInit(){
  		this.loggedIn = this.loginService.isLoggedIn();
    	if(this.loggedIn==false){
			this.route.navigate(['login'])
			this.toastService.showWarning('Session expired..Please login again')
		}
		var type_id=localStorage.getItem('user_type_id');
		/*
		if(type_id=='4'){
			this.route.navigate(['home'])
		}
		*/
		this.open=true;
		this.http.get("https://www.shopemailer.com/api/getProfilePic").subscribe(data => {
			if(data) {
				this.show = true;
		    	this.profile_photo = data[0].profile_pic;
			}
		    },err=>{
	    		this.toastService.showWarning('Connection Error .... ')
	    });
	    this.getNotification();
	    
	    this.http.get("https://www.shopemailer.com/api/getgensetting").subscribe(data => {
  		//console.log("general info ::"+ JSON.stringify(data));
  		    this.data=data;
            if(this.data!="")
     		this.helpdesk_title = this.data[0].helpdesk_title;
     		this.logoimage = this.data[0].logo_img;
    	}); 
	    
 	}
 	disableHref(event){
 	   event.stopPropagation();
 	}
 	getNotification(){
 		this.http.get("https://www.shopemailer.com/api/getNotifications").subscribe(data => {
			if(data)
		    	this.notifications = data;
		    	this.notificationCount=this.notifications.length;
		    },err=>{
		    	//alert('Err')
	    });
 	}
 	markAsRead(ticket_id){
 		this.read=false;
 		this.http.post("https://www.shopemailer.com/api/markAsRead",{ticket_id:ticket_id}).subscribe(data => {
			this.getNotification();
			this.route.navigate(['dashboard/ticketDetail',ticket_id])
		    },err=>{
		    	//alert('Err')
	    });
 	}
 	
   	toggle(){
  	    this.prof.nativeElement.classList.remove("show");
	}
	toggleNotify(){
	     this.notify.nativeElement.classList.remove("show");
	}
  	logoutfun(){
  		this.loginService.logout();
  	}
}
