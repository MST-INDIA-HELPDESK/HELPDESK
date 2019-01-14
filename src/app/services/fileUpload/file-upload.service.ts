import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn:'root'
})
export class FileUploadService {
	profile_photo;
	constructor(private http: HttpClient) { }
  
  	profPicUpload(uploadData) {
  		return this.http.post("https://www.shopemailer.com/api/uploadfile", uploadData)
	}
	
	fileUpload(uploadData) {
		return this.http.post("https://www.shopemailer.com/api/fileupload", uploadData)
	}

	articlefileUpload(uploadData){
		console.log('articleUpload')
		return this.http.post("https://www.shopemailer.com/api/articlefileUpload", uploadData)
	}
	
	logoUpload(uploadData){
		console.log('logo upload')
		return this.http.post("https://www.shopemailer.com/api/logoUpload", uploadData)
	}
}
 