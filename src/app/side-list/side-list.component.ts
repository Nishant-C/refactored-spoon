import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
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
    if(localStorage.getItem("stock-list") != null)
      this.listOfShares = JSON.parse( localStorage.getItem("stock-list") || '{}');
  }

  onAddBtnClick(value: string) {
    if(value.replaceAll(" ", "") == ""){
      this._snackBar.open("Share name is empty", "Done")
      return;
    }

    const index = this.listOfShares.indexOf(value, 0);
    if(index != -1){
      this._snackBar.open("Stock already added", "Done")
      return;

    }

    // if(this.searchForCompany(value) == false){
    //   this._snackBar.open("No stock company found! Enter a valid stock symbol.", "Done")
    //   return;
    // }

      this.searchForCompany(value)


  }

  searchForCompany(name: string){
  
      var urlSearch = 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords='+ name.replaceAll(" ","") +'&apikey=UFUGQQC467MHKOH1'
      this.http.get<any>(urlSearch).subscribe(responseData => {
        if(responseData["bestMatches"][0]){
          var firstMatch = responseData["bestMatches"][0]["1. symbol"]
          if(firstMatch.toLowerCase() == name.toLowerCase()){
            this.listOfShares.push(name);
            console.log(JSON.stringify(this.listOfShares));
            localStorage.setItem("stock-list", JSON.stringify(this.listOfShares));

            this.searchInput   = "";
            return
          }
            
        }

        this._snackBar.open("No stock company found! Enter a valid stock symbol.", "Done")
          
        
      });
    


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

}
