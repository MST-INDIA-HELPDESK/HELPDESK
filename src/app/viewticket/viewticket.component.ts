import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FileUploadService } from '../services/fileUpload/file-upload.service';
import { LoginService } from '../services/login/login.service';
import { ToastService } from '../services/toast/toast.service';

@Component({
  selector: 'app-viewticket',
  templateUrl: './viewticket.component.html',
  styleUrls: ['./viewticket.component.css']
})
export class ViewticketComponent implements OnInit {
  @ViewChild("replyPic") fileInputVariable: any;
  
  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private loginService : LoginService, private toastService:ToastService, private fileUploadService:FileUploadService) { }
  user_id;loggedIn;ticketInfo;ticketId;ticketUser;ticketReplys;ratings;ratingWidth;
  profilePic;type_id;reply;selectedFile;filenm;
  
  ngOnInit() {
    this.loggedIn = this.loginService.isLoggedIn();
    console.log(this.loggedIn)
    this.route.params.subscribe( params => {
      this.ticketId = params.id,
      this.ticketUser = params.email
    });

    if(this.loggedIn == true) {
      this.user_id=localStorage.getItem('user_id');
      this.type_id=localStorage.getItem('user_type_id');
      this.http.post("https://www.shopemailer.com/api/getUserTicketsById", {ticketid: this.ticketId}).subscribe(data => 
      {
        if(data) {
          this.ticketInfo = data;
        }
      });
    } else {
      this.http.post("https://www.shopemailer.com/api/getTypeIdByEmail",{email: this.ticketUser}).subscribe(data=> {
        if(data) {          
          this.user_id = data[0].id;
          this.type_id = data[0].type_id;
        }
      });
      this.http.post("https://www.shopemailer.com/api/viewTicketInfo",{ticketid: this.ticketId, email: this.ticketUser}).subscribe(data => 
      {
        if(data) {
          this.ticketInfo = data;
        }
      });
    }
    
    this.http.post("https://www.shopemailer.com/api/getTicketsReplys", {tid: this.ticketId}).subscribe(data => {
      //console.log("replys :: "+JSON.stringify(data));
      if(data) {
        this.ticketReplys = data;
        console.log(JSON.stringify(this.ticketReplys));
      }
    });
  }

  filename(e){
    this.filenm = this.fileInputVariable.nativeElement.files[0].name;
  }

  postReply(reply,id){
    if(this.loggedIn == true) {
      let curDate = new Date();
      let createdDate = curDate.getFullYear() +"-"+(((curDate.getMonth()+1) < 10)?"0":"") + (curDate.getMonth()+1) +"-"+ ((curDate.getDate() < 10)?"0":"") + curDate.getDate() + " " + ((curDate.getHours() < 10)?"0":"") + curDate.getHours() +":"+ ((curDate.getMinutes() < 10)?"0":"") + curDate.getMinutes() +":"+ ((curDate.getSeconds() < 10)?"0":"") + curDate.getSeconds();
      var type = localStorage.getItem('replyType');
      if(type == null){
        type='comment';
      }    
      this.selectedFile = this.fileInputVariable.nativeElement.files[0];
      if(typeof this.selectedFile !== 'undefined') {
        let file: File = this.selectedFile;
        let formData: FormData = new FormData();
        formData.append('imageUpload',  this.selectedFile, this.selectedFile.name);
        console.log("File Name ::" + this.selectedFile.name);
        this.fileUploadService.logoUpload(formData).subscribe(res =>{
          if(res[0].result == 'success') {
            var data={reply:reply,reply_id:id,type:type,img:res[1].logoimage,ticket_id:this.ticketId,created_date:createdDate,updated_date:createdDate}
            this.http.post("https://www.shopemailer.com/api/giveReply", { data:data }).subscribe(data => {
              if(data) {
                this.ticketReplys = data;
              }
              this.filenm ='';
            });
          }
          else {
            this.toastService.showError('File upload error ... ')
            console.log("file not inserted;");
          }
        });
      }
    }
    else {
      this.toastService.showError("You must be login..!");
    }
  }

	calcWidth(rating){
		var data = (rating * 100) / 5 ;
		return data+'%';
	}

	rating(e, id, rating){    
    if(this.loggedIn == true){
      let rect = e.target.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let c = (x/100)*5;
      this.ratings = c.toFixed(2);
      this.http.post("https://www.shopemailer.com/api/calcSolutionRatings",{tid: this.ticketId, rid:id, rating:this.ratings}).subscribe(data => {
        if(data) {
          this.ticketReplys = data;          
        }
      });
    }
    else {
      this.toastService.showError("Please login to give rating..!");
    }
	}
}
