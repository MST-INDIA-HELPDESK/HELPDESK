import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'

@Component({
  selector: 'app-allnotifications',
  templateUrl: './allnotifications.component.html',
  styleUrls: ['./allnotifications.component.css']
})
export class AllnotificationsComponent implements OnInit {
  notifications:any=[]; message : any ='';
  constructor(private http:HttpClient, private route:Router) { }

	ngOnInit() {
	  	this.http.get("https://www.shopemailer.com/api/getAllnotifications").subscribe(data => {
		      this.notifications = data
		      if(data==""){
		        this.message="No any notifications found for you .... ";
		      }
	    });
	}
  
	markAsRead(ticket_id){
 		//this.read=false;
 		this.http.post("https://www.shopemailer.com/api/markAsRead",{ticket_id:ticket_id}).subscribe(data => {
			//this.getNotification();
			this.route.navigate(['dashboard/ticketDetail',ticket_id])
		    },err=>{
		    	//alert('Err')
	    });
 	}
 	

}
