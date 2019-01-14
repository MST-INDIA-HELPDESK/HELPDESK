import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
	typeid;

	constructor() { }

	ngOnInit() {
		var type_id=localStorage.getItem('user_type_id');
		if(type_id=='1'){
			this.typeid = true;
		}
	}

}
