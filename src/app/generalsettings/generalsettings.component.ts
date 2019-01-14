import { Component, OnInit ,ViewChild, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FileUploadService } from '../services/fileUpload/file-upload.service';
import { Title } from '@angular/platform-browser';
import { ToastService } from '../services/toast/toast.service';
import { SharedService } from '../services/sharedService/shared.service';

@Component({
  selector: 'app-generalsettings',
  templateUrl: './generalsettings.component.html',
  styleUrls: ['./generalsettings.component.css']
})
export class GeneralsettingsComponent implements OnInit {
	userid;file;imageUpload;imagepreview:boolean;type_id;gensettingid;logoimage;logo_img;chkdata:boolean;selectedFile :File = null;generalinfo;helpdesk_title;websitetitle;websiteurl;helpdesktitle;helpdeskurl;webmasteremail;fromemail;fromname;mutiplelang;defaultlanguage:any=[];
	logourl = 'https://www.shopemailer.com/logos/yourlogohere.jpg';
	data;filenm;
    @ViewChild("logoUpload") fileInputVariable: any;
    //imgData = new EventEmitter<any>();
    constructor(private sharedService: SharedService, private titleService: Title, private route: ActivatedRoute,private http: HttpClient,private fileUploadService:FileUploadService, private toast:ToastService) { }

	ngOnInit() {
	    this.imagepreview = false;
		this.http.get("https://www.shopemailer.com/api/getgensetting").subscribe(data => {
  		console.log("general info ::"+ JSON.stringify(data));
  		    this.data=data;
            if(this.data!=""){
            	this.chkdata = true;
            this.gensettingid = this.data[0].id;	
            this.websitetitle = this.data[0].website_title;
     		this.helpdesktitle = this.data[0].helpdesk_title;
     		this.helpdeskurl = this.data[0].helpdesk_url;
     		this.webmasteremail = this.data[0].webmaster_email;
     		this.fromemail = this.data[0].from_email;
     		this.fromname = this.data[0].fromname;
     		this.logoimage = this.data[0].logo_img;	
     		this.titleService.setTitle(this.websitetitle);
            }
            else{
            	this.chkdata = false;
            }
     		
    	});  
    	
    	var type_id=localStorage.getItem('user_type_id');
		if(type_id=='1'){
	//	console.log("this is admin");	
		this.type_id = true;
		}
    	
	}
  
     reset (){
	  this.websitetitle ='';
	  this.websiteurl ='';
	  this.helpdesktitle ='';
	  this.helpdeskurl ='';
	  this.webmasteremail ='';
	  this.fromemail ='';
	  this.fromname ='';
	  this.defaultlanguage = [];
	  this.mutiplelang ='';
    }
    
	filename(event){
  	    //this.filenm = this.fileInputVariable.nativeElement.files[0].name;
  	    if (event.target.files && event.target.files[0]) {
            var reader = new FileReader();
              this.file = event.target.files[0];
              reader.readAsDataURL(this.file); // read file as data url
              reader.onload = (event:any) => { // called once readAsDataURL is completed
                this.logourl = event.target.result;
                this.imagepreview = true;
                //console.log("imagepreview:" +this.imagepreview)
              }
        }
 	}
    saveGenSetg(websitetitle, websiteurl, helpdesktitle, helpdeskurl, webmasteremail, fromemail, fromname, defaultlanguage, mutiplelang, imageUpload) {
	this.selectedFile = this.fileInputVariable.nativeElement.files[0];
		if(typeof this.selectedFile !== 'undefined') {
			let file: File = this.selectedFile;
			let formData: FormData = new FormData();
			formData.append('imageUpload',  this.selectedFile, this.selectedFile.name);
			//console.log("File Name ::" + this.selectedFile.name);
			this.fileUploadService.logoUpload(formData).subscribe(res =>{
				if(res[0].result == 'success') {
					//console.log("file upload done here.....");
					this.http.post("https://www.shopemailer.com/api/setgensetting", {websitetitle: websitetitle, helpdesktitle: helpdesktitle, helpdeskurl: helpdeskurl, webmasteremail: webmasteremail, fromemail: fromemail, fromname: fromname, defaultlanguage: defaultlanguage, mutiplelang: mutiplelang, imageUpload: res[1].logoimage}).subscribe(data => {
   						console.log("general settings data transfer.....");
   						this.toast.showSuccess("Added");
  							this.http.get("https://www.shopemailer.com/api/getgensetting").subscribe(data => {
  							console.log("general info ::"+ JSON.stringify(data));
  							this.helpdesktitle = data[0].helpdesk_title;
     						this.websitetitle = data[0].website_title;
     						this.logoimage = data[0].logo_img;
     						this.chkdata = true;
     						this.titleService.setTitle(this.websitetitle);
     						this.sharedService.imageData.emit({logoimage: this.logoimage, helpdesktitle: this.helpdesktitle});
    					});
					});
				}
				else{
					//this.toastService.showError('Server Error ... ')
					console.log("file not inserted;");
				}
			});
		}
    }
    
	Updtgrlstg(websitetitle, websiteurl, helpdesktitle, helpdeskurl, webmasteremail, fromemail, fromname, defaultlanguage, mutiplelang, imageUpload){
		console.log("in Updtgrlstg function");
		this.selectedFile = this.fileInputVariable.nativeElement.files[0];
		console.log("this.selectedFile :: "+this.selectedFile);
		if(typeof this.selectedFile !== 'undefined') {
		let file: File = this.selectedFile;
		let formData: FormData = new FormData();
		formData.append('imageUpload',  this.selectedFile, this.selectedFile.name);
		//console.log("File Name ::" + this.selectedFile.name);
		this.fileUploadService.logoUpload(formData).subscribe(res =>{
			if(res[0].result == 'success') {
				//console.log("file upload done here.....");
				this.http.post("https://www.shopemailer.com/api/updtgeneralstg",{ websitetitle: websitetitle, helpdesktitle: helpdesktitle, helpdeskurl: helpdeskurl, webmasteremail: webmasteremail, fromemail: fromemail, fromname: fromname, defaultlanguage: defaultlanguage, mutiplelang: mutiplelang, imageUpload: res[1].logoimage}).subscribe(data => {
				console.log("general setting data updated...");
				this.toast.showSuccess("Updated");
					this.http.get("https://www.shopemailer.com/api/getgensetting").subscribe(data => {
		 			//	console.log("general info ::"+ JSON.stringify(data));
		 				this.helpdesktitle = data[0].helpdesk_title
		 				this.websitetitle = data[0].website_title;
		 				this.logoimage = data[0].logo_img;
		 				this.chkdata = true;
		 				//console.log("Title :: "+this.websitetitle);
		 				this.titleService.setTitle(this.websitetitle);
		 				this.sharedService.imageData.emit({logoimage: this.logoimage, helpdesktitle: this.helpdesktitle});
					});
				});
			}
			else{
				//this.toastService.showError('Server Error ... ')
				console.log("file not inserted;");
			}
		});
		}
		else{
			this.http.post("https://www.shopemailer.com/api/updtgeneralstg",{ websitetitle: websitetitle, helpdesktitle: helpdesktitle, helpdeskurl: helpdeskurl, webmasteremail: webmasteremail, fromemail: fromemail, fromname: fromname, defaultlanguage: defaultlanguage, mutiplelang: mutiplelang, imageUpload:imageUpload}).subscribe(data => {
				console.log("general setting data updated...");
				this.toast.showSuccess("Updated");
					this.http.get("https://www.shopemailer.com/api/getgensetting").subscribe(data => {
		 			//	console.log("general info ::"+ JSON.stringify(data));
		 				this.websitetitle = data[0].website_title;
		 				this.chkdata = true;
		 				//console.log("Title :: "+this.websitetitle);
		 				this.titleService.setTitle(this.websitetitle);
		 				this.logoimage = data[0].logo_img;
		 				this.sharedService.imageData.emit({logoimage: this.logoimage, helpdesktitle: this.helpdesktitle});
					});
				});
		}
	}
    
}