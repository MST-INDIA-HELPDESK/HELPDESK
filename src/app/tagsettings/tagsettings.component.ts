import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../services/toast/toast.service';

@Component({
  selector: 'app-tagsettings',
  templateUrl: './tagsettings.component.html',
  styleUrls: ['./tagsettings.component.css']
})
export class TagsettingsComponent implements OnInit {
	tagnm;tags;message;editdata:boolean;id;
  constructor(private route: ActivatedRoute,private http: HttpClient, private toast:ToastService) {
  this.message="";
  	
  }

  ngOnInit() {
  	this.http.get("https://www.shopemailer.com/api/getalltag").subscribe(data => {
  		console.log("All tag ::"+ JSON.stringify(data));
    	this.tags = data;
    	//console.log("data found ::"+JSON.stringify(this.tags));
    	if(this.tags.length==0){
            this.message="No Tag found ...."
        }
    });
    this.editdata = false;
  }
  
  reset (){
	  this.tagnm ='';
  }
  
  saveTag(tagnm) {
    this.http.post("https://www.shopemailer.com/api/newtag", {tagnm: tagnm}).subscribe(data => {
        if(data == 'Tag Exist') {
			this.toast.showWarning('Tag already exist')
		}
		else {
	 		this.toast.showSuccess('New Tag added')
		}
		this.reset();
        this.http.get("https://www.shopemailer.com/api/getalltag").subscribe(data => {
    		this.tags = data;
    		if(this.tags.length==0){
                this.message="No Tag found ...."
            }
    	});
    	
    });
    this.message="";
  }
  
  edittag(id){
   console.log("edit tag ID ::"+id);	
    if(id) {
    	this.editdata = true;
		this.http.post("https://www.shopemailer.com/api/getTagById", {tagid: id}).subscribe(data => {
    	this.id = data[0].id;
    	this.tagnm = data[0].tag_name;
	 });
    }
  }
  
	updateTag(id, tagnm){
	  this.http.post("https://www.shopemailer.com/api/updatetag",{ tagnm: tagnm, tag_id: id}).subscribe(data => {
			if(data == 'Tag Exist') {
				this.toast.showWarning('Tag already exist')
			}
			else {
	 			this.toast.showSuccess('Tag Updated')
			}
			this.http.get("https://www.shopemailer.com/api/getalltag").subscribe(data => {
    		this.tags = data;
    		this.tagnm ='';
    		this.editdata = false;
    		});
		});
	}
  
  deltag(id){
    console.log("delete tag ID ::"+id);	
    this.reset();
    this.editdata = false;
    if(id) {
	this.http.post("https://www.shopemailer.com/api/deltag", {tagid: id}).subscribe(data => {
    	this.tags = data;
    	if(this.tags.length==0){
        		this.message="No Tag found ...."
        }
    	this.toast.showSuccess("Tag Removed");
	 });
    }
  }
  
  cancel(){
  	this.tagnm ='';
  	this.editdata = false;
  }
  
}