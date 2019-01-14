import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../services/toast/toast.service';

@Component({
  selector: 'app-categoryknowledgebase',
  templateUrl: './categoryknowledgebase.component.html',
  styleUrls: ['./categoryknowledgebase.component.css']
})
export class CategoryknowledgebaseComponent implements OnInit {
		cateorytitle;type;

  constructor(private route: ActivatedRoute,private http: HttpClient, private toast:ToastService) { }

  ngOnInit() {
  /*	this.http.get("http://192.168.0.10:8091/api/newknowledgebasecategory").subscribe(data => {
  		console.log("parent_category ::"+ JSON.stringify(data));
    	this.parentcat = data;
    });*/
  }

  reset (){
	  this.cateorytitle ='';
	  this.type = '';
  }
  onClickcategory(data) {
	console.log("category ::"+ JSON.stringify(data));
    this.http.post("https://www.shopemailer.com/api/newknowledgebasecategory", {cattitle: data.cateorytitle, type: data.type}).subscribe(data => {
      this.toast.showSuccess("Category Added");
      if(typeof data !== 'undefined') {
      	console.log("newcategory data transfer.....");
      	this.reset();
      }
    });
  }
}
