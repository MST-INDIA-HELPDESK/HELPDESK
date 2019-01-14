import { Component, OnInit,ViewChild ,ElementRef} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FileUploadService } from '../services/fileUpload/file-upload.service';
import { ToastService } from '../services/toast/toast.service';
import { LoginService } from '../services/login/login.service';
declare var $: any;

@Component({
  selector: 'app-topic-form',
  templateUrl: './topic-form.component.html',
  styleUrls: ['./topic-form.component.css'],
  providers: [DatePipe]
})

export class TopicFormComponent implements OnInit {
	catid:number;modalId;loggedIn:boolean;
	name:string;result;success;ticketId;updatedData;uploadData;selectedFile: File = null;previewFile;
	firstnm;lastnm;uticketemail;usersubject;usermessage;
	//@ViewChild('subject') focusElement: ElementRef;
    @ViewChild('subject') focus: any;
	@ViewChild("fileUpload") fileInputVariable: any;
	@ViewChild('myModel') myModel: ElementRef;user:any=[];
	constructor(private router:Router,private route: ActivatedRoute, private http: HttpClient, private datePipe: DatePipe, 
	private fileUploadService: FileUploadService,private loginService:LoginService,private toastService:ToastService) { }
	

	ngOnInit() {	
		this.loggedIn = this.loginService.isLoggedIn();
  		if(this.loggedIn==true) {
  			setTimeout(() => this.focus.nativeElement.focus(),500);
  			this.http.get("https://www.shopemailer.com/api/getUserProfile").subscribe(data => {  
				this.user = data;
			}); 
		}
		this.route.params.subscribe(params => {
			this.catid = params.id;
			this.name = params.name;
		});
	}

	reset() {
		this.firstnm = '';
		this.lastnm = '';
		this.uticketemail = '';
		this.usersubject = '';
		this.usermessage = '';
	}
	
	newTicket(data) {
		let curDate = new Date();
		let createdDate = curDate.getFullYear() +"-"+(((curDate.getMonth()+1) < 10)?"0":"") + (curDate.getMonth()+1) +"-"+ ((curDate.getDate() < 10)?"0":"") + curDate.getDate() + " " + ((curDate.getHours() < 10)?"0":"") + curDate.getHours() +":"+ ((curDate.getMinutes() < 10)?"0":"") + curDate.getMinutes() +":"+ ((curDate.getSeconds() < 10)?"0":"") + curDate.getSeconds();
		this.selectedFile = this.fileInputVariable.nativeElement.files[0];
		if(typeof this.selectedFile !== 'undefined') {
			let file: File = this.selectedFile;
			let formData: FormData = new FormData();
			formData.append('image', file, this.selectedFile.name);
			this.fileUploadService.fileUpload(formData).subscribe(res =>{
				if(res[0].result == 'success') {
					this.toastService.showSuccess("File uploaded successfully");
					this.http.post("https://www.shopemailer.com/api/genTickets",{fnm: data.firstnm, lnm: data.lastnm, email: data.uticketemail, subject: data.usersubject, message: data.usermessage, createdDate: createdDate, updatedDate: createdDate, prio: 'Medium', status: 1, topic: this.catid,attached_file:res[1].file_name}).subscribe(data => {  
						this.ticketId = data;
						$(this.myModel.nativeElement).modal('show'); 
						this.reset();
					}); 
				}
				else{
					this.toastService.showError('Server Error ... ')
				}
			});
		}
		else {
			this.http.post("https://www.shopemailer.com/api/genTickets",{fnm: data.firstnm, lnm: data.lastnm, email: data.uticketemail, subject: data.usersubject, message: data.usermessage, createdDate: createdDate, updatedDate: createdDate, prio: 'Medium', status: 1, topic: this.catid}).subscribe(data => {  
				this.ticketId = data;
				$(this.myModel.nativeElement).modal('show'); 
				this.reset();
			}); 
		}
	}
	viewTicket() {
	    $(this.myModel.nativeElement).modal('hide'); 
		this.router.navigate(['mytickets']);
	}
}
