import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FilterPipe }from '../pipes/filter.pipe';
import { FileUploadService } from '../services/fileUpload/file-upload.service';
import { LoginService } from '../services/login/login.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast/toast.service';
import { SharedService } from '../services/sharedService/shared.service';
declare var $ :any;
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers:[FilterPipe]
})

export class UserComponent implements OnInit {
	user:boolean;filterData:any=[];
	all:boolean;admin:boolean;agent:boolean;managers:boolean;
	delBtn:boolean;p:any;
	profileData;updatedData;
	emptyMessage;searchUser;usersData;arrdel;_taskdata;allTasks;
	fname;lname;phone;address;facebook;twitter;company;editUserData;uid;userId;userTypeId;
	userType;user_type;first_name;last_name;email;password;pass;allSelect;
	delarr:any = [];
	
	url = 'assets/images/profile-img.jpg'; public show:boolean = false; public onSelected:boolean = false;
	profile_photo;
	file;
	selectedFile :File = null;
	select_file;
	@ViewChild('AddUser') AddUser: ElementRef;
	@ViewChild('EditUser') EditUser: ElementRef;
	
  constructor(private sharedService: SharedService,private http: HttpClient,private filterPipe: FilterPipe,private fileUploadService:FileUploadService, private auth: LoginService,private route:Router,private toastService:ToastService) {this.all=true;}

	ngOnInit() {
		this.getUsers();
		this.userId = localStorage.getItem('user_id');
		this.userTypeId = localStorage.getItem('user_type_id'); 
		this.http.get('https://www.shopemailer.com/api/getUserType').subscribe(data=>{
	  		this.userType = data;
	  	});
	}

	getUsers(){
			this.http.post("https://www.shopemailer.com/api/getUsersDetails", {}).subscribe(data=>{
			this.usersData = data;	
			this.filterData = data;
		});	
	}

	deleteUser(id){ 
		this.http.post("https://www.shopemailer.com/api/deleteUserDetails",{uid:id}).subscribe(data=>{
			 //this.usersData = data;
			 this.filterData = data;
		}); 
	}
	
	getData(str){
	if(str=='admin'){
			this.emptyMessage='';
			this.admin=true;
			this.all=false;
			this.agent=false;
			this.managers=false;
			this.user=false;
		}
		if(str=='all'){
			this.emptyMessage='';
			this.all=true;
			this.admin=false;
			this.agent=false;
			this.managers=false;
			this.user=false;
		}
		if(str=='agent'){
			this.emptyMessage='';
			this.agent=true;
			this.admin=false;
			this.all=false;
			this.managers=false;
			this.user=false;
		}
		if(str=='managers'){
			this.emptyMessage='';
			this.managers=true;
			this.admin=false;
			this.all=false;
			this.agent=false;
			this.user=false;
		}
		if(str=='users'){
			this.emptyMessage='';
			this.user=true;
			this.admin=false;
			this.all=false;
			this.agent=false;
			this.managers=false;
		}
		this.http.post("https://www.shopemailer.com/api/getUsersDetails",{param:str}).subscribe(data=>{
			this.filterData = data;	
		});	
	}
	
	filterSearch(){
		this.filterData=this.filterPipe.transform(this.usersData,this.searchUser);
		if(this.searchUser=="") this.filterData=[];
    	if(this.filterData==""){
			console.log(JSON.stringify(this.filterData));
			if(this.searchUser=="")
			{
				this.filterData=this.usersData;
			}
			else{
				this.emptyMessage="No relevant User found...";	
			}
		}	
		else{
			this.emptyMessage="";
		}
	}
	
	chkAll(ev){
	  	this.filterData.forEach(x => x.selected = ev.target.checked)
  		this.delBtn=true;
  		if(ev.target.checked==true){
		     for(var i=0;i<this.filterData.length;i++) {
		     	this.delarr.push(this.filterData[i].user_id);
		     }	
	  	}
	  	else{
	  		this.delarr=[];
	  		this.delBtn=false;
	  	}
	  	console.log(this.delarr);
	}
		
	selectedChk(ev,item){
		this.delBtn=true;
		if(ev.target.checked==false){
			this.delarr.splice(this.delarr.indexOf(item),1)
			if(this.delarr==""){
				this.delBtn=false;
			}
		}
		else{
			this.delarr.push(item);
		}
		this.allSelect = this.filterData.every(function(i:any) {
			console.log(i.selected)
			return i.selected==true;
		})
	}

	deleteAll(){
		this.http.post("https://www.shopemailer.com/api/deleteAllUsers",{deleteArr:this.delarr}).subscribe(data=>{
			if(data=='success'){
				this.getUsers();
				this.delarr=[];
				this.delBtn=false;
			}
		});	
		
	}
	
	editUser(id){
		this.uid=id;
		this.http.post("https://www.shopemailer.com/api/editUsers",{usrid:id}).subscribe(data=>{
			this.show = true;
			this.onSelected = false;
			this.editUserData=data;
			this.editUserData.forEach(element => {
				this.fname =element.first_name;	
				this.lname =element.last_name;	
				this.address =element.address;	
				this.phone =element.phone;	
				this.facebook =element.facebook;	
				this.twitter =element.twitter;
				this.company =element.company;
			});
			//console.log("editUserData= "+JSON.stringify(this.editUserData));
		});
	}
	
	reset(){
		this.fname ='';	
		this.lname ='';	
		this.address ='';	
		this.phone ='';	
		this.facebook ='';	
		this.twitter ='';
		this.company ='';
	}
	updateUsers(newData){
		this.http.post("https://www.shopemailer.com/api/updateUsersDetails",{uFname:newData.fname,uLname:newData.lname,uEmail:newData.email,uAddr:newData.address,uPh:newData.phone,uFb:newData.facebook,uTwit:newData.twitter,uComp:newData.company,uId:this.uid}).subscribe(data=>{
			//this.fupService.fileUpload(event);
			if(typeof newData !== 'undefined') {
				$(this.EditUser.nativeElement).modal("hide");
				this.reset();
			}
			this.getUsers();
		});
	}
	
	onSelectFile(event) {
		this.onSelected = true;
		this.show = false;
		this.selectedFile = event.target.files[0];
		const uploadData = new FormData();
	    uploadData.append('image', this.selectedFile, this.selectedFile.name);
	    
	    this.fileUploadService.profPicUpload(uploadData).subscribe(res=>{
	    	console.log(res[0].profile_pic);
    		this.profile_photo=res[0].profile_pic;
    		this.sharedService.imageData.emit({profileimage: this.profile_photo});
    		this.getUsers();
	    },err=>{
	    	console.log(err);
	    });
	}
	
    addUsers(data){
	this.pass=123;
	this.auth.signup(data.first_name, data.last_name, data.email, this.pass, data.user_type);
	   console.log(data.user_type);
		this.http.post("https://www.shopemailer.com/api/resetPass",{email:data.email}).subscribe(data => {
	    },err=>{
		    this.toastService.showError('Connection Error ')
		});
		if(typeof data !== 'undefined') {
			$(this.AddUser.nativeElement).modal("hide");
			this.resetAll();
		}
    }
  
    resetAll(){
		this.user_type ='';	
		this.first_name ='';	
		this.last_name ='';	
		this.email ='';	
		//this.password ='';	
		//this.confpass ='';
	}
}

