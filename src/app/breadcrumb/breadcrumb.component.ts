import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router'
import {Location} from '@angular/common';
import { map, filter } from 'rxjs/operators';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';


@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {

    constructor(private route:Router,private router: ActivatedRoute,private location:Location) { }
    
    ngOnInit() {
    }
    back(){
        console.log(this.location)
        this.location.back();
    }
}
