import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from '../services/login/login.service';
declare var $: any;

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.css']
})
export class TopicsComponent implements OnInit {
  isActive:boolean;
  findForm:boolean;
  mailSent: boolean;
  topics;allTickets;

  constructor(private router:Router, private http: HttpClient, private route: ActivatedRoute, private loginService : LoginService) {
    this.isActive = false;
  }

  ngOnInit() {    
    
    this.http.get("https://www.shopemailer.com/api/getTopics").subscribe(data => 
    {
      this.topics = data;
    });
    this.mailSent = false;
  }
}
