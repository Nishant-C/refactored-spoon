import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-side-list',
  templateUrl: './side-list.component.html',
  styleUrls: ['./side-list.component.less']
})
export class SideListComponent implements OnInit {

  currentSelectedItem: string = ""
  searchInput: string = ""
  constructor(private _snackBar: MatSnackBar, private http: HttpClient) { }

  @Output() appStockSelected = new EventEmitter<string>();
  

  listOfShares: string[] = []
  shareSearchInput: string = "";
  ngOnInit(): void {
    this.loadLocalStorage();
  }

  onListItemDelete($event: any){
    
    var toDelete = $event.currentTarget.parentElement.childNodes[0].textContent.replaceAll(" ", "");

    const index = this.listOfShares.indexOf(toDelete, 0);
    if (index > -1) {
      this.listOfShares.splice(index, 1);
      console.log(this.listOfShares);
      localStorage.setItem("stock-list", JSON.stringify(this.listOfShares));
    }

  }

  shareSelectionChange($event: any){
    this.currentSelectedItem = $event.option.getLabel().replace("delete", "");
    console.log(this.currentSelectedItem);
    this.appStockSelected.emit(this.currentSelectedItem);
  }

  inputEmpty(): boolean{
    if(this.searchInput == "" || this.searchInput == undefined)
      return true;

    return false
  }

  loadLocalStorage() {    
    if(localStorage.getItem("stock-list") != null){
      var localStorJSON = JSON.parse( localStorage.getItem("stock-list") || '{}');
      var sharesMap = new Map(Object.entries(localStorJSON));
      this.listOfShares = Array.from(sharesMap.keys());
    }
  }
}
