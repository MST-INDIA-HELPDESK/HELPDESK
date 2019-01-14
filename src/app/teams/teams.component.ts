import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  members;membercounts;uid;uemail;
  teams;teamname;teamdesc;
  selectedMembers: any[];
  @ViewChild('AddTeam') AddTeam: ElementRef;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.membercounts = 0;
    this.http.get("https://www.shopemailer.com/api/getMembers").subscribe(data => {
      //console.log(JSON.stringify(data));
      this.members = data;
    });
    this.http.get("https://www.shopemailer.com/api/getTeams").subscribe(data => {
      this.teams = data;
    });
  }

  reset() {
    this.teamname = '';
    this.teamdesc = '';
    this.selectedMembers = [];
    this.membercounts = 0;
  }

  createTeam(data) {
    this.http.post("https://www.shopemailer.com/api/addTeam", {tnm: data.teamname, tdesc: data.teamdesc, tmem: data.selectedMembers}).subscribe(data => {
      if(typeof data !== 'undefined') {
        $(this.AddTeam.nativeElement).modal("hide");
        this.reset();
        this.teams = data;
      }
    });
  }

  getMember(item) {
    this.membercounts = item.length;
  }

  editTeam(id) {
    if(id) {
      this.router.navigate(['/dashboard/updateteam', id]);
    }
  }

  delTeam(id) {
    if(id) {
      this.http.post("https://www.shopemailer.com/api/delTeam", {tid: id}).subscribe(data => {
        if(typeof data !== 'undefined') {
          this.teams = data;
        }
      });
    }
  }
}
