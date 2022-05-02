import { Component } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'stock-chart';

  selectedStockName: string = "";

  shareChangedToDetail: Subject<string> = new Subject<string>();
  
  stockSelected($event: any){
    //alert("Event Recieved: "+ $event)
    this.selectedStockName = $event;
    this.shareChangedToDetail.next(this.selectedStockName);
  }

}
