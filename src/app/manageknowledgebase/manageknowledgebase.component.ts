import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
declare var $: any;

@Component({
  selector: 'app-manageknowledgebase',
  templateUrl: './manageknowledgebase.component.html',
  styleUrls: ['./manageknowledgebase.component.css']
})
export class ManageknowledgebaseComponent implements OnInit {
    category:any=[];
    name: string;
    menu: Array<any> = [];
    breadcrumbList: Array<any> = [];
    constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

    ngOnInit() {
        
      	this.http.get("https://www.shopemailer.com/api/showknowledgebasecategory").subscribe(data => {
      		//console.log("category ::"+ JSON.stringify(data));
         	this.category = data;
        });
    }
    
}
