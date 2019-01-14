import { Component, OnInit,ViewChild,ElementRef} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FileUploadService } from '../services/fileUpload/file-upload.service';
import { ActivatedRoute,Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';
import { ToastService } from '../services/toast/toast.service';
import { NotifyService } from '../services/notify/notify.service';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css']
})
export class TicketDetailComponent implements OnInit {
    @ViewChild('hist') hist:ElementRef;selectedFile;tags;selectedTag:any=[];
    @ViewChild("replyPic") fileInputVariable: any; filenm;selectedCan;reply;tagData:any=[];
	user_id;expand:boolean;priorities:any=[];id;type;agents:any=[];ticket:any=[];ticketStatus:any=[];teams:any=[];history:any=[];
  	selectedAgent;selectedStatus;selectedPriority;Open;Closed;Resolved;selectedTeam:any=[];data:any=[];created_date;created_by;
  	replies:any=[];allReplies:any=[];count;hideme:any=[];comments:any=[]; notes:any=[];notesCount;commentsCount;defalutPic;updateTicket;
  	newAssignee;newProfile;loggedIn;updatePic;assigneePic;sub;canResponses;public show:boolean = false;
  	constructor(private http: HttpClient,private route:ActivatedRoute,private loginService: LoginService,
  	private toastService:ToastService,private router:Router,private notifyService:NotifyService,private fileUploadService:FileUploadService) { 
  		this.defalutPic="assets/images/profile-img.jpg";
  		this.updatePic==false;
  		//this.selectedTag=[1,2]
  	}

  	ngOnInit() {
		this.loggedIn = this.loginService.isLoggedIn();
		if(this.loggedIn==false){
			this.router.navigate(['login'])
			this.toastService.showWarning('Session expired..Please login again')
		}
  		localStorage.setItem('replyType','comment');
	  	this.route.params.subscribe(param=>{
	  		this.id=param['id']; //ticketID
	  		this.type=param['type'];
		});
	  	this.user_id=localStorage.getItem('user_id');
  		this.getTickets();
		this.getAllRepliesCount();
		this.Open="Open"; this.Closed="Closed";this.Resolved="Resolved";
		
		this.http.post("https://www.shopemailer.com/api/getTagsByTicket",{ticket_id:this.id}).subscribe(data => {
  	    	if(data!=""){
  	    	this.selectedTag = new Array();
  	        this.tagData=data;
	  	        for(let i=0; i<this.tagData.length; i++){
	  	    		this.selectedTag.push(this.tagData[i].tag_id);
				}
				console.log(this.selectedTag);
	  	    }
      	})
	  	this.http.get("https://www.shopemailer.com/api/getPriorities").subscribe(data => {
	      this.priorities = data;
	    },err=>{
    		this.toastService.showError('Connection error...')
	    });
	    
    	this.http.get("https://www.shopemailer.com/api/getCannedRes").subscribe(data => {
		      this.canResponses = data;
		    },err=>{
		    	//alert('Err')
	    });
	    this.http.get("https://www.shopemailer.com/api/getTags").subscribe(data => {
		      this.tags = data;
		    },err=>{
		    	//alert('Err')
	    });
	    
    	this.http.get("https://www.shopemailer.com/api/getPriorities").subscribe(data => {
	      this.priorities = data;
	    },err=>{
	    	//alert('Err')
	    });
	    this.http.get("https://www.shopemailer.com/api/getAgents").subscribe(data => {
	      this.agents = data;
	     },err=>{
	    	//alert('Err')
	    });
	    this.http.get("https://www.shopemailer.com/api/getTicketStatus").subscribe(data => {
	      this.ticketStatus = data;
	    },err=>{
	    	//alert('Err')
	    });
	    
	  	this.http.get("https://www.shopemailer.com/api/getTeams").subscribe(data => {
	  	this.teams = data;
	    },err=>{
	    	//alert('Err')
	    });
	    
	    this.http.post("https://www.shopemailer.com/api/getHistory",{ticket_id:this.id}).subscribe(data => {
	  	this.history = data;
	    },err=>{
	    	//alert('Err')
	    });
  	}
    
    getCan(id){
        var obj = this.canResponses.filter(book => book.id === id);
        if(obj)
        this.reply=obj[0].message;
    }
  	getTickets(){
  		this.http.post("https://www.shopemailer.com/api/getTicketDetails",{id:this.id, type:this.type}).subscribe(data => {
  		this.show = true;
      	this.ticket = data;
      	
      	this.http.post("https://www.shopemailer.com/api/getAssigneePic",{user_id:this.ticket[0].assignee}).subscribe(res => {
      		this.show = true;
      		this.assigneePic=res[0].profile_pic;
       	})
      	
  		
      	if(this.ticket!=""){
      		this.created_date=this.ticket[0].created_date;
      		this.created_by=this.ticket[0].user_name;
      		if(this.ticket[0].team!=null){
				let team = this.ticket[0].team.split(",");
				for(let i=0; i<team.length; i++){
					this.selectedTeam.push(team[i]);
				}
	      	}
    	}
   	    },err=>{
	    	//alert('Err')
	    });
  	}

 	getAllRepliesCount(){
  	this.http.post("https://www.shopemailer.com/api/getAllReply",{ticket_id:this.id}).subscribe(data => {
      	this.allReplies = data;
      	if(this.allReplies){
      		this.count=this.allReplies.length;
  			for(let i=0; i<this.allReplies.length; i++){
  				if(this.allReplies[i].type=='comment'){
  					this.comments.push(this.allReplies[i]);
  				//	console.log(JSON.stringify(this.comments))
  				}else{
  					this.notes.push(this.allReplies[i]);
  				}
  			}
			this.notesCount=this.notes.length;
  			this.commentsCount=this.comments.length;
      	}
  		})
  	}
  	filename(e){
  	    this.filenm = this.fileInputVariable.nativeElement.files[0].name;
 	}
  	getAllReplies(){
		this.http.post("https://www.shopemailer.com/api/getAllReply",{ticket_id:this.id}).subscribe(data => {
      	this.allReplies = data;
      	this.count=this.allReplies.length;
      	this.show = true;
		})
  	}
  	getReply(type){
   		var data={type:type,ticket_id:this.id}
  		this.http.post("https://www.shopemailer.com/api/getReply",{data:data}).subscribe(data => {
      	this.allReplies = data;
      	})
      	
  	}
  	replyType(type){
  		localStorage.setItem('replyType',type);
	}
	postReply(reply,id){
		let curDate = new Date();
    	let createdDate = curDate.getFullYear() +"-"+(((curDate.getMonth()+1) < 10)?"0":"") + (curDate.getMonth()+1) +"-"+ ((curDate.getDate() < 10)?"0":"") + curDate.getDate() + " " + ((curDate.getHours() < 10)?"0":"") + curDate.getHours() +":"+ ((curDate.getMinutes() < 10)?"0":"") + curDate.getMinutes() +":"+ ((curDate.getSeconds() < 10)?"0":"") + curDate.getSeconds();
		var type=localStorage.getItem('replyType');
		if(type==null){
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
				        var data={reply:reply,reply_id:id,type:type,img:res[1].logoimage,ticket_id:this.id,created_date:createdDate,updated_date:createdDate}
                		this.http.post("https://www.shopemailer.com/api/postReply",{data:data}).subscribe(data => {
                      	this.getAllReplies();
                    	this.filenm ='';
                	    	if(type=="comment"){
                	    	this.comments.push(reply)
                	    	this.commentsCount=this.comments.length;
                	    	localStorage.removeItem('replyType');
                	    	}else{
                	    	this.notes.push(reply);
                	    	this.notesCount=this.notes.length;
                	    	localStorage.removeItem('replyType');
                	    	}
                    	if(this.allReplies)
                      	this.count=this.allReplies.length;
                  		},err=>{
                  		    this.toastService.showError('Error... ')
                  		})
					}
					else{
					this.toastService.showError('File upload error ... ')
				}
			    });
	    	}
	}
	onRemoveTag(tag){
	    alert(JSON.stringify(tag))
	    this.data={ticket_id:this.id,tag:tag.value.id}
	    this.http.post("https://www.shopemailer.com/api/deleteTicketTag",{data:this.data}).subscribe(data => {
            if(data){
                console.log(data)
            }
        },err=>{
            this.toastService.showError('Error while deleting ... ')
        })
	}
  	update(val,type,target_id){
  	    if(type=="tag"){
            this.data={ticket_id:this.id,tag:val}
            this.http.post("https://www.shopemailer.com/api/insertTicketTag",{data:this.data}).subscribe(data => {
                  this.toastService.showSuccess('Tag Added');
            })
  	    }else{
      	 	if(type=="status"){
    			this.data={ticket_id:this.id,type:type,target_id:target_id,user_id:this.user_id,subject:type,assignee:target_id,status:val}
    			if(this.user_id==target_id){
    				console.log("false")
    			}else{
    				this.notifyService.notify(this.data).subscribe(res =>{
    				console.log("user notified")
    				})
    			}
    		}
    		else if(type=="priority"){
    			this.data={ticket_id:this.id,type:type,target_id:target_id,user_id:this.user_id,subject:type,assignee:target_id,priority:val}
    			if(this.user_id==target_id){
    				console.log("false")
    			}else{
    				this.notifyService.notify(this.data).subscribe(res =>{
    				console.log("user notified")
    				})
    			}
    		}
    		else if(type=="assignee"){
    			this.data={ticket_id:this.id,type:type,target_id:target_id,user_id:this.user_id,subject:type,assignee:target_id}
    			if(target_id==this.user_id){
    				console.log("false")
    			}else{
    				console.log("notify")
    				this.notifyService.notify(this.data).subscribe(res =>{
    				console.log("user notified")
    				})
    			}
    			
    		}else{
    			this.data={ticket_id:this.id,type:type,team:val}
    		}
    	this.http.post("https://www.shopemailer.com/api/updateTicket",{data:this.data}).subscribe(data => {
        this.updateTicket = data;
            if(data!="nothingToReturn"){
            this.show = true;
            this.updatePic=true;
            this.newAssignee=this.updateTicket[0].assignee;
            this.newProfile=this.updateTicket[0].profile_pic;
            }
            this.toastService.showSuccess(type.toUpperCase() +' Updated');
            },err=>{
                this.toastService.showError('Error while updateing ... ')
            });
        }
 	}
  	
  	updateReply(reply,id){
  		let curDate = new Date();
    	let createdDate = curDate.getFullYear() +"-"+(((curDate.getMonth()+1) < 10)?"0":"") + (curDate.getMonth()+1) +"-"+ ((curDate.getDate() < 10)?"0":"") + curDate.getDate() + " " + ((curDate.getHours() < 10)?"0":"") + curDate.getHours() +":"+ ((curDate.getMinutes() < 10)?"0":"") + curDate.getMinutes() +":"+ ((curDate.getSeconds() < 10)?"0":"") + curDate.getSeconds();
  		var data={reply:reply, id:id,updated_date:createdDate};
 		this.http.post("https://www.shopemailer.com/api/updateReply",{data:data}).subscribe(data => {
      	this.getAllReplies();
      	if(this.allReplies)
      	    this.count=this.allReplies.length;
  		})
  	}
  	deleteReply(id,type){
  		this.http.post("https://www.shopemailer.com/api/deleteReply",{reply_id:id}).subscribe(data => {
      	this.getAllReplies();
      	if(type=="comment"){
      	this.comments.splice(this.comments.indexOf(id),1);
      	this.commentsCount=this.comments.length;
      	}else{
      	this.notes.splice(this.notes.indexOf(id),1);	
  		this.notesCount=this.notes.length;
       	}
      	
      	if(this.allReplies)
      	    this.count=this.allReplies.length;
  		})
  	}
  	
  	toggle(){
  	   this.expand=!this.expand;
   	    console.log(this.expand)
	}

}


