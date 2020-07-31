import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Font-Awesome Icons
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  faLock = faLock;
  faLockOpen = faLockOpen;

  constructor(private router: Router) { }

  ngOnInit(): void { }

}
