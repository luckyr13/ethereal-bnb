import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MainToolbarComponent } from './main-toolbar/main-toolbar.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SelectWalletDialogComponent } from './select-wallet-dialog/select-wallet-dialog.component';
import { WrongNetworkComponent } from './wrong-network/wrong-network.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MainMenuComponent,
    MainToolbarComponent,
    PageNotFoundComponent,
    SelectWalletDialogComponent,
    WrongNetworkComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    AppRoutingModule,
    BrowserAnimationsModule,
  ],
  entryComponents: [
    SelectWalletDialogComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
