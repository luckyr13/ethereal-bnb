import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CharactersRoutingModule } from './characters-routing.module';
import { ListComponent } from './list/list.component';
import { NewComponent } from './new/new.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [ListComponent, NewComponent],
  imports: [
    CommonModule,
    CharactersRoutingModule,
    SharedModule
  ]
})
export class CharactersModule { }
