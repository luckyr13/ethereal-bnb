import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FightRoutingModule } from './fight-routing.module';
import { NewComponent } from './new/new.component';
import { ListComponent } from './list/list.component';

import { SharedModule } from '../shared/shared.module';
import { ModalSearchFighterComponent } from './modal-search-fighter/modal-search-fighter.component';
import { ModalAcceptFightComponent } from './modal-accept-fight/modal-accept-fight.component';

@NgModule({
  declarations: [NewComponent, ListComponent, ModalSearchFighterComponent, ModalAcceptFightComponent],
  imports: [
    CommonModule,
    SharedModule,
    FightRoutingModule
  ], entryComponents: [
    ModalSearchFighterComponent,
    ModalAcceptFightComponent
  ]
})
export class FightModule { }
