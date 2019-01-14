import { Component, OnInit  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';

@Component({
  selector: 'app-knowledge-base',
  templateUrl: './knowledge-base.component.html',
  styleUrls: ['./knowledge-base.component.css']
})
export class KnowledgeBaseComponent implements OnInit {
	articleId;ratings;articleName;solutions;parentCat;category;showArt:boolean;articles;
	constructor(private route: ActivatedRoute,private http: HttpClient,private location:Location) { }

	ngOnInit() {
	    this.route.params.subscribe(params=>{
	  		this.articleId=params.id;
	  		this.parentCat=params.parent_category;
	  		this.articleName=params.name;
	  		this.articles=params.articles;
    	})
	    if(this.articles=='true'){
	    	this.showArt=true;
	    }else{
	    	this.showArt=false;
	    }
	    this.getSolution();
 	}
 	
 	getSolution(){
 		this.http.post("https://www.shopemailer.com/api/getSolutions",{article_id: this.articleId,parent_id:this.parentCat}).subscribe(data => {
			if(data){
				this.solutions = data;
				this.category=data[0].category;
			}
	    },err=>{
	    	console.log(err)
	    });
 	}
 	previousPage(){
 		 this.location.back();
  	}
	calcWith(rating){
		var data = (rating * 100) / 5 ;
		return data+'%';
	}
	rating(type,id){
		this.http.post("https://www.shopemailer.com/api/getYesNos",{article_id: this.articleId,id:id}).subscribe(data => {
			if(type=='yes'){
				var noOfYes = data[0].no_of_yes + 1;
				var noOfNo = data[0].no_of_no;
				var totalCount=noOfNo + noOfYes;
				var perCentage=(noOfYes / totalCount) * 100;
   				this.ratings=(perCentage * 0.05).toFixed(2);
			}else{
				var noOfNo = data[0].no_of_no + 1;
				var noOfYes = data[0].no_of_yes;
				var totalCount=noOfYes + noOfNo;
				var perCentage=(noOfYes / totalCount) * 100;
   				this.ratings=(perCentage * 0.05).toFixed(2);
			}
   			console.log('Rating :'+this.ratings)
   			this.http.post("https://www.shopemailer.com/api/calcRatings",{id:id,no_of_yes:noOfYes,no_of_no:noOfNo,article_id: this.articleId,rating:this.ratings}).subscribe(data => {
	   			this.getSolution();
   			})
   	},err=>{
    		console.log(err)
    	});
	}
}
