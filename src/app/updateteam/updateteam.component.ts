import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from '../services/login/login.service';
import { ToastService } from '../services/toast/toast.service';

@Component({
  selector: 'app-updateteam',
  templateUrl: './updateteam.component.html',
  styleUrls: ['./updateteam.component.css']
})
export class UpdateteamComponent implements OnInit {
  selectedMembers:any = [];selectedUsers:any = [];tid;teams;users;teamusers;typeid;
  teamname;teamdesc;memberCount;items:any = [];loggedIn;
  
  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private login: LoginService, private toast: ToastService) {
    
  }
  
  ngOnInit() {    
    this.loggedIn = this.login.isLoggedIn();
    if(this.loggedIn == true) {
      this.route.params.subscribe(params => {
        this.tid = params.id;
      });
      this.http.get("https://www.shopemailer.com/api/getMembers").subscribe(data => {
        this.users = data;    
      });
      this.http.post("https://www.shopemailer.com/api/getTeamDetailsById", {tid: this.tid}).subscribe(data => {
        this.assignDetails(data);
      });
      this.http.post("https://www.shopemailer.com/api/getTeamMembersById", {tid: this.tid}).subscribe(data => {
        this.teamusers = data;
        this.assignMembers(data);
        this.memberCount = this.selectedUsers.length;      
      });
    }
    else {
      this.router.navigate(['/login']);
    }
  }

  assignDetails(arr) {
    arr.forEach(element => {
      this.teamname = element.name;
      this.teamdesc = element.description;
    });
  }

  assignMembers(arr) {
    this.selectedMembers = new Array();
    arr.forEach(element => {      
      this.selectedUsers.push(element.user_id);
      this.selectedMembers.push(element.user_id);
    });
  }

  addMembers(item) {
    this.selectedUsers.push(item.user_id);
    this.http.post("https://www.shopemailer.com/api/addTeamMembersById", {tid: this.tid, tmem: this.selectedUsers}).subscribe(data => {
      if(data) {
        this.teamusers = data;
        this.selectedUsers = [];
        this.selectedMembers = [];
        this.assignMembers(data);
        this.memberCount = this.selectedUsers.length; 
        this.toast.showSuccess("Member Added");
      }
    });    
  }

  removeMembers(item) {
    this.selectedUsers.splice(this.selectedUsers.indexOf(item.user_id), 1);    
    this.http.post("https://www.shopemailer.com/api/remTeamMembersById", {tid: this.tid, tmem: item.user_id}).subscribe(data => {
      if(data) {
        this.teamusers = data;
        this.selectedUsers = [];
        this.selectedMembers = [];
        this.assignMembers(data);
        this.memberCount = this.selectedUsers.length;
        this.toast.showSuccess("Member Removed");
      }
    });    
  }

  clear() {
    this.selectedMembers = [];
  }

  remFromTeam(id) {
    this.selectedUsers.splice(this.selectedUsers.indexOf(id), 1);    
    this.http.post("https://www.shopemailer.com/api/remTeamMembersById", {tid: this.tid, tmem: id}).subscribe(data => {
      if(data) {
        this.teamusers = data;
        this.assignMembers(data);
        this.memberCount = this.selectedUsers.length; 
        this.toast.showSuccess("Member Removed");
      }
    });   
  }

  updateTeam(record) {
    if(record) {
      this.http.post("https://www.shopemailer.com/api/updateTeamById", {tid: this.tid, tnm: record.teamname, tdesc: record.teamdesc}).subscribe(data => {
        if(data) {
          this.teamusers = data;
          this.assignDetails(data);
          this.memberCount = this.selectedUsers.length; 
          this.toast.showSuccess("Team Updated..!");
        }
      });
    }
  }

  back() {
    this.router.navigate(['dashboard/teams']);
  }
  
}
