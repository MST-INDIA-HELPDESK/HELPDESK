import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})

export class FilterPipe implements PipeTransform {
	usersData;
    transform(items: any[], searchUser: string): any[]{
	console.log(items + " String " + searchUser)
    if(!items) return [];
    if(!searchUser) return items;
	searchUser = searchUser.toLowerCase();
	return items.filter(item => 
	    Object.keys(item).some(k => item[k] != null && 
	    item[k].toString().toLowerCase()
	    .includes(searchUser.toLowerCase()))
	    );
   }
}
