import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  constructor(private http: HttpClient) { }
  
  notify(data){
  	return this.http.post("https://www.shopemailer.com/api/notifyUser",{data:data})
  }
}
