import { Component,OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Observable, fromEvent, merge, of } from 'rxjs';
import { ToastService } from './services/toast/toast.service';
import { mapTo } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
  
})
export class AppComponent implements OnInit  {
	website_title;data;online$: Observable<boolean>;name;
    public constructor(private http: HttpClient, private titleService: Title,private toastService:ToastService) { 
    
    this.online$ = merge(of(navigator.onLine),
      fromEvent(window, 'online').pipe(mapTo(true)),
      fromEvent(window, 'offline').pipe(mapTo(false))
    )
    this.networkStatus()
    }  

    ngOnInit(){
  	this.http.get("https://www.shopemailer.com/api/getgensetting").subscribe(data => {
  		    this.data=data;
            if(this.data!="")
     		this.website_title = this.data[0].website_title;
     		this.titleService.setTitle(this.website_title);
    	});
    }
  
    public networkStatus() {
        this.online$.subscribe(value => {
        if(value==false){
             this.toastService.showError('Network Unavailable')
        }
    })
  }
  
}
