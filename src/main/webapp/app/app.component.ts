import { Component, inject, OnInit } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import dayjs from 'dayjs/esm';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import locale from '@angular/common/locales/en';
// jhipster-needle-angular-add-module-import JHipster will add new module here

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { AccountService } from 'app/core/auth/account.service';
import { fontAwesomeIcons } from './config/font-awesome-icons';
import MainComponent from './layouts/main/main.component';

@Component({
  selector: 'jhi-app',
  template: '<jhi-main />',
  standalone: true, // Assuming standalone component based on imports array
  imports: [
    MainComponent,
    // jhipster-needle-angular-add-module JHipster will add new module here
  ],
})
export default class AppComponent implements OnInit {
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly iconLibrary = inject(FaIconLibrary);
  private readonly dpConfig = inject(NgbDatepickerConfig);
  private readonly accountService = inject(AccountService); // Inject AccountService

  constructor() {
    this.applicationConfigService.setEndpointPrefix(SERVER_API_URL);
    registerLocaleData(locale);
    this.iconLibrary.addIcons(...fontAwesomeIcons);
    this.dpConfig.minDate = { year: dayjs().subtract(100, 'year').year(), month: 1, day: 1 };
  }

  ngOnInit(): void {
    // Force user identity loading at application startup to react to a potentially existing JWT token in localStorage
    // The identity() method is used to trigger the check for an existing JWT token and load the account.
    this.accountService.identity().subscribe();
  }
}