import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from '../services/login/login.service';
import { ToastService } from '../services/toast/toast.service';
declare var $: any;

@Component({
  selector: 'app-mytickets',
  templateUrl: './mytickets.component.html',
  styleUrls: ['./mytickets.component.css']
})
export class MyticketsComponent implements OnInit {
  findForm:boolean;inputRadios;loggedIn;tickets;

  @ViewChild('ticketModel') ticketModel : ElementRef;

  constructor(private router:Router, private http: HttpClient, private route: ActivatedRoute, 
  private loginService : LoginService,private toastService:ToastService) { 
    this.findForm = false;
  }

  ngOnInit() {
    this.inputRadios = "Open";
    this.loggedIn = this.loginService.isLoggedIn();
    if(this.loggedIn==true){
  		localStorage.getItem('user_id');
  		this.http.get("https://www.shopemailer.com/api/getAllTicketsById").subscribe(data => 
      {
        this.tickets=data;
        console.log(JSON.stringify(data));
        this.loginService.setData(data);
      });
    }
    $(".modal-backdrop.fade.show").remove();
    }

	showTicket(data) {
    this.router.navigate(['viewticket', data.searchticketid, data.searchticketemail]);
	}
	
	showTicketbyId(data) {
    this.router.navigate(['viewticket', data.searchticketid, '']);
  }
  
  viewTicketId(e) {
    this.http.post("https://www.shopemailer.com/api/getTicketsByEmail", {usEmail: e.uemailid, usChoice: e.inputRadios}).subscribe(data => {
      if(data == 'sent') {
          $(this.ticketModel.nativeElement).modal("show");
      }
    });        
  }

  forgetTicketId() {
    this.findForm = true;
  }
}
