import browser from 'browser-detect';
import {Component, Inject, OnInit} from '@angular/core';
import {Store, select} from '@ngrx/store';
import {Observable} from 'rxjs';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {environment as env} from '../../environments/environment';

import {
  authLogin,
  authLogout,
  routeAnimations,
  AppState,
  LocalStorageService,
  selectIsAuthenticated,
  selectSettingsStickyHeader,
  selectSettingsLanguage,
  selectEffectiveTheme
} from '../core/core.module';
import {
  actionSettingsChangeAnimationsPageDisabled,
  actionSettingsChangeLanguage
} from '../core/settings/settings.actions';


export interface DialogData {
  count:number
}

@Component({
  selector: 'anms-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routeAnimations]
})
export class AppComponent implements OnInit {
  isProd = env.production;
  envName = env.envName;
  version = env.versions.app;

  theme$: Observable<string>;

  showing_info = false;

  apartments = [
    {
      title: "Rua Jaques Félix 76",
      subtitle: "Ap.92 • Edifício Lucia • Vila Nova Conceição, São Paulo-SP",
      image: "https://content.loft.com.br/homes/n32keo/desktop_banner.jpg"
    },
    {
      title: "Alameda Campinas 1085",
      subtitle: "Ap.62 • Edifício Tarumã • Jardim Paulista, São Paulo-SP",
      image: "https://content.loft.com.br/homes/11nuokd/desktop_banner.jpg"
    },
    {
      title: "Rua Tuim 603",
      subtitle: "Ap.24 • Edifício Ana Lucia • Moema Pássaros, São Paulo-SP",
      image: "https://content.loft.com.br/homes/dlkfh/desktop_banner.jpg"
    },
    {
      title: "Rua Doutor Veiga Filho 815",
      subtitle: "Ap.74 • Edifício GUARATUBA • Higienópolis, São Paulo-SP",
      image: "https://content.loft.com.br/homes/wvx805/desktop_banner.jpg"
    },
    {
      title: "Avenida Santo Amaro 1817",
      subtitle: "Ap.53 • Edifício Vila Nova • Moema Pássaros, São Paulo-SP",
      image: "https://content.loft.com.br/homes/7t7srn/desktop_banner.jpg"
    },
  ];

  current_apartment = this.apartments[0];

  constructor(
    private store: Store<AppState>,
    private storageService: LocalStorageService, public dialog: MatDialog) {
  }


  ngOnInit(): void {
    this.storageService.testLocalStorage();
    this.theme$ = this.store.pipe(select(selectEffectiveTheme));
  }

  show_apartment(apartment: { title: string; subtitle: string; image: string; }): void {
    this.current_apartment = apartment;
    this.showing_info = false;
  }

  set_interest(apartment: { interest: boolean; title: string; subtitle: string; image: string; }, positive: boolean): void {
    apartment.interest = positive;
    let index = this.apartments.indexOf(apartment);
    index += 1;
    if (index == this.apartments.length) {
      console.log('FINISH');
      this.dialog.open(FinishDialog, {
        width: '250px',
        data: {count:3}
      });
    } else {
      this.show_apartment(this.apartments[index]);
    }

  }
}


@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'finish-dialog.html',
})
export class FinishDialog {

  constructor(
    public dialogRef: MatDialogRef<FinishDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
