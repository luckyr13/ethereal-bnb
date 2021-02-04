import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	public loading: boolean = true;

  constructor() { }

  ngOnInit(): void {
  	this.loading = false;
  }

}
