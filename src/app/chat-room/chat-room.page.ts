import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.page.html',
  styleUrls: ['./chat-room.page.scss'],
})
export class ChatRoomPage implements OnInit {

  username: string;

  algorithm: string;
  message: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.username = this.activatedRoute.snapshot.paramMap.get('username');
  }

  sendMessage() {
    if (this.message && this.algorithm) {
      const data = {
        message: this.message,
        algorithm: this.algorithm
      };
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

}
