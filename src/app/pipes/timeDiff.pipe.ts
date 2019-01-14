import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common'
@Pipe({
  name: 'timeDiff'
})

export class TimeDiffPipe implements PipeTransform {
    
	usersData; timeDiff;diff;dayDiff:any;hours;now;minutes;days;diff_as_date;
    
    transform(updatedDate:any): any{
    	//console.log('Date ',updatedDate)
    	var datePipe = new DatePipe("en-US");
    	this.timeDiff='';
     	this.now = new Date();
    	this.timeDiff = this.now.getTime() - new Date(updatedDate).getTime();
		this.hours=Math.floor(this.timeDiff / 1000 / 60 / 60); 
		this.days = this.hours / 24;
		//console.log('Hours',this.hours )
	if(this.days > 1)
    	{
    		var extHours=this.hours % 24;
    		var day=Math.trunc(this.days);
    		if(day < 30 ){
    			if(day==1)
    			this.dayDiff=' Yesterday '+ extHours +' hours ago';
    			else
    			this.dayDiff=day +' days '+ extHours +' hours ago';
    		}
			else{
				var month = Math.floor(day / 30);
				if(month==1)
				this.dayDiff=month + " month ago";
				else
				this.dayDiff=month + " months ago";
				if(month > 12){
					var year = Math.floor(month / 12)
					if(year==1)
					this.dayDiff=year + " year ago";
					else
					this.dayDiff=year + " years ago";
				}
			}
  		}
		else {
			//console.log('else days',this.days )
		 	this.minutes = (this.timeDiff / (1000 * 60)).toFixed(1);
		 	var minutes=Math.trunc(this.minutes)
	 	 	this.hours = (this.timeDiff / (1000 * 60 * 60)).toFixed(2);
		 	if(this.hours > 1){
	 			var hours=Math.trunc(this.hours)
		 		if (hours==1){
			 		this.dayDiff="Today " + hours +" hour ago";
			 		}
			 		else if(hours > 23){
		 			this.dayDiff="Yesterday";
			 		}else{
			 			this.dayDiff="Hours "+ hours + " ago";
		 			}
			 	}else if(minutes > 1){
			 		this.dayDiff="Today " + minutes +" minutes ago";
			 	}else{
		 		this.dayDiff="Just now";
		 	}
		}
		return this.dayDiff;
   }
}

