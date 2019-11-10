import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.page.html',
  styleUrls: ['./chat-room.page.scss'],
})
export class ChatRoomPage implements OnInit {

  username: string;

  algorithm: string;
  messageText: string;

  users = [];
  messages = [];

  isUserMe: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private socket: Socket
  ) { }

  ngOnInit() {
    this.username = this.activatedRoute.snapshot.paramMap.get('username');
    this.socket.connect();

    this.socket.emit('sign-in', this.username);

    this.subscribeToUsers();
    this.subscribeToChat();
  }

  sendMessage() {
    if (this.messageText && this.algorithm) {
      const data = {
        username: this.username,
        message: this.messageText,
        algorithm: this.algorithm
      };

      this.socket.emit('chat', data);

    } else {
      const errorData = {
        header: 'Hata!',
        subHeader: 'Eksik argüman',
        message: 'Mesaj girmediniz veya algoritma seçimi yapmadınız.',
        buttons: 'Tamam'
      };
      this.alert(errorData);
    }
  }

  async alert(alertData) {
    const alert = await this.alertController.create({
      header: alertData.header,
      subHeader: alertData.subHeader,
      message: alertData.message,
      buttons: [alertData.buttons]
    });
    await alert.present();
  }

  subscribeToUsers() {
    this.socket.fromEvent('users').subscribe(data => {
      this.users.push(data);
    });
  }

  subscribeToChat() {
    this.socket.fromEvent('chat').subscribe(data => {
      this.messages.push(data);
    });
  }

}
