import { Component, OnInit, Input } from '@angular/core';
import { Observable, share, Subject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { observeNotification } from 'rxjs/internal/Notification';
import { NgxChartsModule } from '@swimlane/ngx-charts';
@Component({
  selector: 'app-detail-view',
  templateUrl: './detail-view.component.html',
  styleUrls: ['./detail-view.component.less']
})
export class DetailViewComponent implements OnInit {

  options: any;
  updateOptions: any;
  titleText: string = "No Share Selected";
  stockName: string = "";


  //new chart

  multi: any[] = [];
  view: [number, number] = [1400, 700];

  // options
  legend: boolean = false;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Time';
  yAxisLabel: string = 'Value';
  timeline: boolean = true;
  yScaleMin: number = 0;
  yScaleMax: number = 0;
  update$: Subject<any> = new Subject();

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  //

  private shareChangedSubscription: Subscription | undefined;

  private now: Date = new Date();
  private value: number = 0;
  private data: any[] = [];
  private timer: any;
  filter: string = "current";

  @Input()
  events!: Observable<string>;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {

    this.shareChangedSubscription = this.events.subscribe(($event) => this.updateShare($event));
  }

  updateShare(shareValue: string): void {
    this.stockName = shareValue;
    this.titleText = this.stockName
    console.log("share:" + shareValue);
    if (shareValue != "" && shareValue != undefined)
      this.fetchData(shareValue, this.filter);

  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  async fetchData(shareSymbol: string, filter: string) {

    shareSymbol = shareSymbol.replaceAll(" ", "");
    switch(filter){

      case "current":
        console.log("From current")
        this.processDataForDaily(shareSymbol);
        break;

      case "month":
        this.processDataForMonthly(shareSymbol);
        break;
      case "year":
        this.processDataForYearly(shareSymbol);
        break;
      default:
        break;
    }
    //this.updateChart(); 

  }


  processDataForDaily(name: string) {

    var urlIntraday = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol='+ name + '&interval=5min&apikey=UFUGQQC467MHKOH1';

    this.http.get<any>(urlIntraday).subscribe(responseData => {
      var timeSeriesData = responseData["Time Series (5min)"]
      var max = 0, min = 10000000000, count = 0;
      this.data = []
      for (var dateTime in timeSeriesData) {
  
        this.now = new Date(dateTime);
        this.value = timeSeriesData[dateTime]["3. low"];
        this.data.push({
          name: this.now,
          value: [
            Math.round(this.value)
          ]
        })
  
        if(this.value> max) max = this.value;
  
        if(this.value < min) min = this.value;
        count++;
      }
      this.multi= []
      if(count>0){
        this.multi = [{
          "name": "Appl",
          "series": this.data
        }]
        this.yScaleMax = Math.round(max+(0.1*max));
        this.yScaleMin = Math.round(min-(0.1*min));
    
        console.log(this.multi)
      }
    })
  }

  processDataForMonthly(name: string){
    var urlMonthly = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+ name +'&apikey=UFUGQQC467MHKOH1'
    this.http.get<any>(urlMonthly).subscribe(responseData => {
      var timeSeriesData = responseData["Time Series (Daily)"]
      var count = 0;
      var max = 0, min = 10000000000;
      this.data = []
      for (var dateTime in timeSeriesData) {
        if (count >= 30) break;
        this.now = new Date(dateTime);
        this.value = timeSeriesData[dateTime]["3. low"];
        this.data.push({  
          name: dateTime,
          value: [
            Math.round(this.value)
          ]
        })
        if(this.value> max) max = this.value;
  
        if(this.value < min) min = this.value;
        count++;
      }

      this.multi = []
      if(count>0){
        this.multi = [{
          "name": "Appl",
          "series": this.data.reverse()}]
  
        this.yScaleMax = Math.round(max+(0.1*max));
        this.yScaleMin = Math.round(min-(0.1*min));
      }
    })
    console.log(this.multi)

  }
  processDataForYearly(name: string) {

    var urlMonthly = 'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol='+ name +'&apikey=UFUGQQC467MHKOH1'
    this.http.get<any>(urlMonthly).subscribe(responseData => {
      var timeSeriesData = responseData["Monthly Time Series"]
      var count = 0;
      var max = 0, min = 10000000000;
      this.data = []
      for (var dateTime in timeSeriesData) {
        if (count >= 12) break;
        this.now = new Date(dateTime);
        this.value = timeSeriesData[dateTime]["3. low"];
        this.data.push({  
          name: [this.now.getFullYear(), this.getMonthText(this.now.getMonth() + 1)].join(' '),
          value: [
            Math.round(this.value)
          ]
        })
        if(this.value> max) max = this.value;
  
        if(this.value < min) min = this.value;
        count++;
      }

      this.multi = []
      if(count>0){
        this.multi = [{
          "name": "Appl",
          "series": this.data.reverse()}]
  
        this.yScaleMax = Math.round(max+(0.1*max));
        this.yScaleMin = Math.round(min-(0.1*min));
      }
    })
    console.log(this.multi)
  }



  private getMonthText(num: number): any {
    var month;
    switch (num) {
      case 1: month = "Jan";
        break;
      case 2: month = "Feb";
        break;
      case 3: month = "Mar";
        break;
      case 4: month = "April";
        break;
      case 5: month = "May";
        break;
      case 6: month = "Jun";
        break;
      case 7: month = "July";
        break;
      case 8: month = "Aug";
        break;
      case 9: month = "Sept";
        break;
      case 10: month = "Oct";
        break;
      case 11: month = "Nov";
        break;
      case 12: month = "Dec";
        break;
      default: 
        break;
    }

    return month;

  }

  onFilterChange(value: any){
    this.filter = value;
    console.log("Hello" + value);
    this.fetchData(this.stockName, this.filter);
  }

  updateChart(){
    this.update$.next(true);
}

}



