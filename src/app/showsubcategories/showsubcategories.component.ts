import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../services/toast/toast.service';

@Component({
  selector: 'app-showsubcategories',
  templateUrl: './showsubcategories.component.html',
  styleUrls: ['./showsubcategories.component.css']
})
export class ShowsubcategoriesComponent implements OnInit {

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private toast:ToastService) { }
  catid;subcatarticles;catnm;solution;articleid;message='';
  
    ngOnInit() {
	    this.route.params.subscribe(params => {
	      this.catid = params.id;
	      this.catnm = params.category_title
	    });
	    this.http.post("https://www.shopemailer.com/api/getkbsubcatarticle", {subcatid: this.catid}).subscribe(data => {
            this.subcatarticles = data;
            if(this.subcatarticles.length==0){
                this.message="No articles found ...."
            }
	    });
    }
    
    movearticle(catid){
    	this.router.navigate(['/manageknowledgebase/showsubcategories/articleknowledgebase', {cat_id:catid}]);
    }
    
    editarticle(id){
		this.router.navigate(['./manageknowledgebase/articleknowledgebase', {art_id:id}]);
	}
	
    delarticle(id){
        if(id) {
            this.http.post("https://www.shopemailer.com/api/delarticle", {aid: id}).subscribe(data => {
              	if(typeof data !== 'undefined') {
                  this.http.post("http://192.168.0.10:8091/api/getkbsubcatarticle", {subcatid: this.catid}).subscribe(data => {
                    this.toast.showSuccess("Article Removed");
                    this.subcatarticles = data;
                    if(this.subcatarticles.length==0){
                        this.message="No articles found ...."
                    }
        	    });
            }
            });
        }
    }
}