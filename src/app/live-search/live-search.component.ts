import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import {data} from './data';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';

export interface Stock {
  "1. symbol": string;
  "2. name": string;
  "3. type": string;
  "4. region": string;
  "5. marketOpen": string;
}

@Component({
  selector: 'app-live-search',
  templateUrl: './live-search.component.html',
  styleUrls: ['./live-search.component.less']
})
export class LiveSearchComponent implements OnInit {
  myControl = new FormControl('');
  searchInput: string = "";
  suggestions: Stock[] = [];
  filteredSuggestions: Observable<Stock[]> = new Observable();
  
  public listOfShares:Map<string, string> = new Map<string, string>();

  @Output() stockAdded = new EventEmitter<string>();
  constructor(private _snackBar: MatSnackBar, private http: HttpClient) { 
  }

  ngOnInit(): void {
    if(localStorage.getItem("stock-list") != null){
      var localStorJSON = JSON.parse( localStorage.getItem("stock-list") || '{}');
      this.listOfShares = new Map(Object.entries(localStorJSON));
    }

    this.filteredSuggestions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(name => (name ? this.searchKey(name) : this.suggestions.slice())),
    );
    
  }

  searchKey(value: string){
    // this.suggestions.push(value);
    // if(this.listOfShares.has(value);){
    //   this._snackBar.open("Stock already added", "Done")
    //   return;
    // }

    var urlSearch = 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords='+ value.replaceAll(" ","") +'&apikey=UFUGQQC467MHKOH1'
    this.http.get<any>(urlSearch).subscribe(responseData => {
      //var responseData = data;
      this.suggestions = responseData["bestMatches"];
      console.log(this.suggestions);
      // if(this.suggestions.length <= 0)
      //   this._snackBar.open("No stock company found! Enter a valid stock symbol.", "Done")
    });

    return this.suggestions;
  }

  public addStock(stock: any){
    let symbol = stock["1. symbol"];
    let name = stock["2. name"];
    this.listOfShares.set(symbol, name);
    var mapAsString = JSON.stringify(this.mapToObj(this.listOfShares))
    console.log(mapAsString);
    localStorage.setItem("stock-list", mapAsString);
    this.searchInput   = "";
    this.clearSuggestions();
    this.stockAdded.emit(stock);
  }

  mapToObj(map: any){
    const obj = {};
    for (let [k,v] of map)
      obj[k] = v;
    return obj;
  }

  clearSuggestions(){
    this.suggestions = [];
  }

  displayFn(stock: Stock): string {
    return stock && stock["2. name"] ? stock["2. name"]: '';
  }
}
