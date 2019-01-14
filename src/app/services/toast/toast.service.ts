import { Injectable,ViewChild } from '@angular/core';
import { ToastrService,ToastContainerDirective } from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})
export class ToastService {
	@ViewChild(ToastContainerDirective) toastContainer: ToastContainerDirective;

	constructor(private toastr: ToastrService) {
	
	}
	
	ngViewAfterInit() {
	this.toastr.overlayContainer = this.toastContainer;
	}
	
	showSuccess(msg) {
		setTimeout(() => {
		  this.toastr.success(msg);
		}, 500);
	}
	showWarning(msg) {
		setTimeout(() => {
		  this.toastr.warning(msg, 'Warning!');
		}, 500);
	}
	showError(msg) {
		setTimeout(() => {
		  this.toastr.error(msg, 'Error..!');
		}, 500);
	}
     
}
