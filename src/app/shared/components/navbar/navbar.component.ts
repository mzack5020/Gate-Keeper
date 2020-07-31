import { Component, Input } from '@angular/core';

// Font-Awesome Icons
import { faKey, faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  // Used to highlight current tab
  @Input()
  activeTab: string;

  // Font Awesome
  faKey = faKey;
  faLock = faLock;
  faLockOpen = faLockOpen;

  constructor() { }

}