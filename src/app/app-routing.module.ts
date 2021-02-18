import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { WrongNetworkComponent } from './wrong-network/wrong-network.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
	{
		path: 'home', component: HomeComponent
	},
	{
		path: '', redirectTo: 'home', pathMatch: 'full'
	},
	{
		path: 'about', component: AboutComponent
	},
	{
		path: 'wrong-network', component: WrongNetworkComponent
	},
	{
		path: '**', component: PageNotFoundComponent
	}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
