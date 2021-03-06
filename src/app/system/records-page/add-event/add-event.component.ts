import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Category} from "../../shared/models/category.model";
import {NgForm} from "@angular/forms";
import {WFMEvent} from "../../shared/models/event.model";
import * as moment from 'moment'
import {EventsService} from "../../shared/services/events.service";
import {BillService} from "../../shared/services/bill.service";
import {Bill} from "../../shared/models/bill.model";
import {el} from "@angular/platform-browser/testing/src/browser_util";
import {mergeMap} from "rxjs/operators";
import {Message} from "../../../shared/models/message.model";
import {Subscription} from "rxjs";

@Component({
  selector: 'wfm-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit, OnDestroy {

  sub1: Subscription;
  sub2: Subscription;

  @Input() categories: Category[] = [];

  types = [
    {type: 'income', label: 'income'},
    {type: 'outcome', label: 'outcome'}
  ];
  message: Message;

  constructor(private eventsService: EventsService, private billService: BillService) {
  }



  ngOnInit() {
    this.message = new Message('danger' , '')
  }
  private showMessage(text: string) {
    this.message.text = text;
    window.setTimeout(() => this.message.text = '', 5000)
  }

  onSubmit(form: NgForm) {
    console.log(form.value);
    let {amount, description, category, type} = form.value;
    if (amount < 0) amount *= -1;
    const event = new WFMEvent(type, amount, +category, moment().format('DD.MM.YYYY HH:mm:ss'), description);

    this.sub1 = this.billService.getBill()
      .subscribe((bill:Bill) => {
        let value = 0;
        if (type === 'outcome') {
          if (amount > bill.value) {
            this.showMessage(`not enough ${amount-bill.value}`);
            return;

          } else {
            value = bill.value - amount
          }

        } else {

          value = bill.value + amount;
        }
       this.sub2 = this.billService.updateBill({value, currency: bill.currency})
          .pipe(mergeMap(() => this.eventsService.addEvent(event)))
          .subscribe(() => {
            form.setValue({
              amount: 0,
              description: ' ',
              category: 1,
              type: 'outcome'
            })
          })
      })

    // this.eventsService.addEvent(event)
  }
  ngOnDestroy(): void {
    if (this.sub1) this.sub1.unsubscribe()
    if (this.sub2) this.sub2.unsubscribe()
  }
}
