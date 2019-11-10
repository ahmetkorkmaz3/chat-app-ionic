import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  username: string;

  constructor(private router: Router) {}

  goChatRoom() {
    if (this.username) {
      this.router.navigate(['chat-room/' + this.username]);
    } else {
      this.router.navigate(['chat-room/anonim']);
    }
  }

}
