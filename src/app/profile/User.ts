export class User {
    //Both the passwords are in a single object
	password: { 
	  pwd: string;
	  confirmPwd: string;
	};
	constructor(values: Object = {}) {
	  //Constructor initialization
      Object.assign(this, values);
  }

}
