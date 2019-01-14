import { Component, OnInit,ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FilterPipe }from '../pipes/filter.pipe';
import { FileUploadService } from '../services/fileUpload/file-upload.service';
import { ToastService } from '../services/toast/toast.service';

@Component({
	selector: 'app-articleknowledgebase',
	templateUrl: './articleknowledgebase.component.html',
	styleUrls: ['./articleknowledgebase.component.css']
})
export class ArticleknowledgebaseComponent implements OnInit {
	//arr=[];arr1=[];
articletype;subject;keywords;selectedFile :File = null;parent_cat;testPriorities;content;directories;article_id;updatearticledata;
@ViewChild("articlefileUpload") fileInputVariable: any;

	constructor(private route: ActivatedRoute,private http: HttpClient, private router: Router, private fileUploadService:FileUploadService, private toast:ToastService) { }
	
	ngOnInit() {
	//	setTimeout(() => this.focusElement.nativeElement.focus(),100);
	
		this.route.params.subscribe(params => {
	        console.log("my art id :: "+params.art_id);
	        console.log("my category id :: "+params.cat_id);
	      this.parent_cat = params.cat_id;
	      this.article_id = params.art_id;
	    });
	    
		if(this.article_id ){
		    this.http.post("https://www.shopemailer.com/api/getArticleById", {artid: this.article_id}).subscribe(data => {
		     // console.log("fetch data for update :: "+JSON.stringify(data));
		      this.subject = data[0].article;
		      this.keywords = data[0].keywords;
		      this.articletype = data[0].article_type;
		      this.content = data[0].content;
		    });
		}
	}
	reset (){
		this.articletype = '';
		this.subject='';
		this.content='';
		this.keywords='';
	}

	onClickarticle(data){
		console.log(data);
		this.http.post("https://www.shopemailer.com/api/newkbarticle",{parent_cat: this.parent_cat, article: data.subject, articletype: data.articletype, content: data.content, keywords: data.keywords}).subscribe(data => {
		console.log("newarticle data inserted...");
		this.toast.showSuccess("Article Added");
		this.reset();
		});
	}
	
	onUpdateaeticle(article_id){
		console.log("update article :: "+ article_id);
		this.http.post("https://www.shopemailer.com/api/updatekbarticle",{ article: this.subject, articletype: this.articletype, content: this.content, keywords: this.keywords, article_id: article_id}).subscribe(data => {
		console.log("article data updated...");
		this.toast.showSuccess("Article Updated");
	});
	}
}



