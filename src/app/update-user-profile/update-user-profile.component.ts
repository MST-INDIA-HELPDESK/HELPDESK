import { Component, Pipe, OnInit, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm, AbstractControl } from '@angular/forms';
import { FileUploadService } from '../services/fileUpload/file-upload.service';
import { ToastService } from '../services/toast/toast.service';
import { SharedService } from '../services/sharedService/shared.service';

@Component({
  selector: 'app-update-user-profile',
  templateUrl: './update-user-profile.component.html',
  styleUrls: ['./update-user-profile.component.css']
})
export class UpdateUserProfileComponent implements OnInit {
  profileData;updatedData;oldPass;value;pwd;confirmPwd;
	url = 'assets/images/profile-img.jpg';
	profile_photo;file;selectedFile :File = null;select_file;
	public show:boolean = false;
  
  constructor(private sharedService: SharedService,private http: HttpClient, private router: Router, private route: ActivatedRoute,private fileUploadService:FileUploadService, private toastService:ToastService) { }

  ngOnInit() {
    this.http.get("https://www.shopemailer.com/api/getUserProfile").subscribe(data => {
			this.profileData = data;
		});
  }

  toggle() {
    this.show = !this.show;
  }

  onClickSubmit(data) {
    this.http.post("https://www.shopemailer.com/api/updateProfile",{fname:data.first_name, lname:data.last_name, company:data.company_name, address:data.address, phone:data.phone_no, facebook:data.facebook, twitter:data.twitter, email:data.email}).subscribe(data => {
    });
    this.toastService.showSuccess('Profile updated')
  }

  changePassword(data){
    //this.user = data;
    this.http.post("https://www.shopemailer.com/api/UpdatePassword",{pwd:data.password.pwd}).subscribe(data => {
    });
    this.toastService.showSuccess('Password updated')
  }	

  onSelectFile(event) {
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
}
