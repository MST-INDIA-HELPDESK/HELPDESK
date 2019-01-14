import { Component, Pipe, OnInit, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm, AbstractControl } from '@angular/forms';
import { User } from './User';
import { FileUploadService } from '../services/fileUpload/file-upload.service';
import { ToastService } from '../services/toast/toast.service';
import { SharedService } from '../services/sharedService/shared.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent implements OnInit {
	profileData;updatedData;oldPass;value;signature;pwd;confirmPwd;
	user:User;url = 'assets/images/profile-img.jpg';
	profile_photo;file;selectedFile :File = null;select_file;
	public show:boolean = false; public img_show:boolean = false; public onSelected:boolean = false;
	after_replying;assigned_to_admin;
	
	constructor(private sharedService: SharedService,private http: HttpClient, private router: Router, private route: ActivatedRoute,private fileUploadService:FileUploadService, private toastService:ToastService) { }
	ngOnInit() {
		this.http.get("https://www.shopemailer.com/api/getUserProfile").subscribe(data => {
			this.img_show=true;
			this.onSelected = false;
			this.profileData = data;
		});
		this.http.get("https://www.shopemailer.com/api/getprofile_preferences").subscribe(data => {
			if(data !=""){
				this.after_replying = data[0].after_replying_to_tkt;
			}
		});
		this.http.get("https://www.shopemailer.com/api/geprofile_notifications").subscribe(data => {
			if(data !=""){
				this.assigned_to_admin = data[0].new_tkt_assigned_to_admin;
			}
		});
		
		this.user =  new User ({ password: { pwd: "" , confirm_pwd: ""} });
	}
	
	toggle() {
    	this.show = !this.show;
	}
	
	onClickSubmit(data) {
		this.http.post("https://www.shopemailer.com/api/updateProfile",{fname:data.first_name, lname:data.last_name, company:data.company_name, address:data.address, phone:data.phone_no, facebook:data.facebook, twitter:data.twitter, email:data.email}).subscribe(data => {
		});
		this.toastService.showSuccess('Profile updated')
	}
	updateSignature(data){
		this.http.post("https://www.shopemailer.com/api/updateSignature",{sign:data.signature}).subscribe(data => {
			this.signature = JSON.stringify(data);
			console.log(+this.signature);
			this.toastService.showSuccess('Signature updated')
		});
	}
	
	changePassword(data){
		this.user = data;
		this.http.post("https://www.shopemailer.com/api/UpdatePassword",{pwd:data.password.pwd}).subscribe(data => {
		});
		this.toastService.showSuccess('Password updated')
	}	

	onSelectFile(event) {
		this.onSelected = true;
		this.img_show=false;
		this.selectedFile = event.target.files[0];
		const uploadData = new FormData();
	    uploadData.append('image', this.selectedFile, this.selectedFile.name);
	    this.fileUploadService.profPicUpload(uploadData).subscribe(res=>{
	    	if(res){
	    	    if(res[0].profile_pic){
	    	        this.toastService.showSuccess('Profile changed successfully')
	    	    }
	    	}
    		this.profile_photo=res[0].profile_pic;
    		this.sharedService.imageData.emit({profileimage: this.profile_photo});
    		this.url=null;
	    },err=>{
	    	console.log(err);
	    });
	}
	
	profile_preferences(data){
		this.http.post("https://www.shopemailer.com/api/profile_preferences",{after_replying:data.after_replying}).subscribe(data => {
			this.toastService.showSuccess('Preferences updated')
		});
	}

	profile_notifications(data){
		this.http.post("https://www.shopemailer.com/api/profile_notifications",{assigned_to:data.assigned_to_admin}).subscribe(data => {
			this.toastService.showSuccess('Notifications updated')
		});	
	}
}
