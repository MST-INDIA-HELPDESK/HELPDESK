import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../services/toast/toast.service';
import { LoginService } from '../services/login/login.service';
import { FilterPipe }from '../pipes/filter.pipe';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers:[FilterPipe]
})
export class HomeComponent implements OnInit {
  filterData:any;loggedIn;
  articles; emptyMessage;searchText;tstatus;isLoggedIn;userNm:any;
  articleNm:any; articlesDesc;category;
  
  	constructor(private router:Router,private filterPipe: FilterPipe,private route: ActivatedRoute,private http: HttpClient,
  	private loginService:LoginService,private toastService:ToastService) {
    this.emptyMessage="";
  	}
  	ngOnInit() {
  		var type_id=localStorage.getItem('user_type_id');
		// allow only users
		if(type_id=='4'){
    		this.isLoggedIn = localStorage.getItem('currentUser');
    		this.http.get("https://www.shopemailer.com/api/showknowledgebasecategory").subscribe(data => {
				this.category = data;
			});
	    var myObj = JSON.parse(localStorage.getItem("currentUser"));
		}else{
	        var access_token=localStorage.getItem('access_token');
            if(access_token!=null)
			this.router.navigate(['dashboard'])
		}
		this.http.get("https://www.shopemailer.com/api/getArticles").subscribe(data => {
	      this.articles = data;
	  	});
        this.http.get("https://www.shopemailer.com/api/getArticlesDesc").subscribe(data => {
            this.articlesDesc = data;
        }); 
	}

	filterSearch(){
		this.filterData=this.filterPipe.transform(this.articles,this.searchText);
		if(this.searchText=="") this.filterData=[];
		if(this.filterData==""){
			this.emptyMessage="No relevant articles found...";
		} else {
			this.emptyMessage="";
		}
	}	
  	newTicket(): void {
	    this.router.navigate(['topics']);
  	}
  	viewTicket(): void {
        if(this.tstatus == 1) {
            if(this.isLoggedIn) {
                this.router.navigate(['mytickets']);
            }
            else {
                this.router.navigate(['login']);
            }
        }
        else {
          this.router.navigate(['mytickets']);
        }
  	}
}
