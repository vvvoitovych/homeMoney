import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";
import { EventsService } from "../../shared/services/events.service";
import { CategoriesService } from "../../shared/services/categories.service";
import { map, mergeMap } from "rxjs/operators";
import { pipe, Subscription } from "rxjs";
import { WFMEvent } from "../../shared/models/event.model";
import { Category } from "../../shared/models/category.model";

@Component({
  selector: 'wfm-history-detail',
  templateUrl: './history-detail.component.html',
  styleUrls: ['./history-detail.component.scss']
})
export class HistoryDetailComponent implements OnInit, OnDestroy {

  event: WFMEvent;
  category: Category[];

  isLoaded = false;
  s1: Subscription;

  constructor(private route: ActivatedRoute,
              private eventsService: EventsService,
              private categoriesService: CategoriesService) {
  }

  ngOnInit() {
    this.s1 = this.route.params
      .pipe(mergeMap((params: Params) => this.eventsService.getEventById(params['id'])),
        mergeMap((event: WFMEvent) => {
          this.event = event;
          return this.categoriesService.getCategoryById(event.category)
        }))
      .subscribe((category: Category[]) => {
        this.category = category;
        this.isLoaded = true;
      })
  }

  ngOnDestroy(): void {
    this.s1.unsubscribe();
  }

}

// this.s1 = this.route.params
//   .pipe(mergeMap((params: Params) => this.eventsService.getEventById(params['id'])))
//   .pipe(mergeMap((event: WFMEvent) => {
//     this.event = event;
//     return this.categoriesService.getCategoryById(event.category)
//   }))
//   .subscribe((category: Category) => {
//     this.category = category;
//     this.isLoaded = true;
//   })
