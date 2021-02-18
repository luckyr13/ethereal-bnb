import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: './wrong-network.component.html',
  styleUrls: ['./wrong-network.component.scss']
})
export class WrongNetworkComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  goBackHome() {
  	this.router.navigate(['/home']);
  }

}
