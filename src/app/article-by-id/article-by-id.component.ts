import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-article-by-id',
  templateUrl: './article-by-id.component.html',
  styleUrls: ['./article-by-id.component.css']
})
export class ArticleByIdComponent implements OnInit {
	subcatarticles;subcatid;category;emptymessage;
	constructor(private http:HttpClient,private route:ActivatedRoute) { }

	ngOnInit() {
	  	this.route.params.subscribe(params => {
	      this.subcatid = params.id
	      this.category=params.category_title
	    });
  		this.http.post("https://www.shopemailer.com/api/getkbsubcatarticle", {subcatid: this.subcatid}).subscribe(data => {
		      this.subcatarticles = data;
		      if(this.subcatarticles.length==0){
  				this.emptymessage="No articles found ..."
		      }
	    });
	}
}
