import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dynamicImgSrc'
})
export class DynamicImgSrcPipe implements PipeTransform {

  transform(updateSrc: any): any {
  	var src=""; 
	if (updateSrc == "" || updateSrc == null){
		src="https://www.shopemailer.com/uploadpics/profile-img.jpg";
	}
	else {
  	    if (updateSrc.indexOf("https") == -1) {
        	src="https://www.shopemailer.com/uploadpics/"+updateSrc;
    	}
    	else {
    		src = updateSrc;
    	}
	}
	return src;
  }

}
