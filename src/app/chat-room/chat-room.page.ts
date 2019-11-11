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

  vigenereKey = 'abc';

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
      console.log(data);
    });
  }

  /* Vigenere Crypt */

  // tslint:disable-next-line: member-ordering
  tabulaRecta = {
    a: 'abcdefghijklmnopqrstuvwxyz',
    b: 'bcdefghijklmnopqrstuvwxyza',
    c: 'cdefghijklmnopqrstuvwxyzab',
    d: 'defghijklmnopqrstuvwxyzabc',
    e: 'efghijklmnopqrstuvwxyzabcd',
    f: 'fghijklmnopqrstuvwxyzabcde',
    g: 'ghijklmnopqrstuvwxyzabcdef',
    h: 'hijklmnopqrstuvwxyzabcdefg',
    i: 'ijklmnopqrstuvwxyzabcdefgh',
    j: 'jklmnopqrstuvwxyzabcdefghi',
    k: 'klmnopqrstuvwxyzabcdefghij',
    l: 'lmnopqrstuvwxyzabcdefghijk',
    m: 'mnopqrstuvwxyzabcdefghijkl',
    n: 'nopqrstuvwxyzabcdefghijklm',
    o: 'opqrstuvwxyzabcdefghijklmn',
    p: 'pqrstuvwxyzabcdefghijklmno',
    q: 'qrstuvwxyzabcdefghijklmnop',
    r: 'rstuvwxyzabcdefghijklmnopq',
    s: 'stuvwxyzabcdefghijklmnopqr',
    t: 'tuvwxyzabcdefghijklmnopqrs',
    u: 'uvwxyzabcdefghijklmnopqrst',
    v: 'vwxyzabcdefghijklmnopqrstu',
    w: 'wxyzabcdefghijklmnopqrstuv',
    x: 'xyzabcdefghijklmnopqrstuvw',
    y: 'yzabcdefghijklmnopqrstuvwx',
    z: 'zabcdefghijklmnopqrstuvwxy'
  };

  vigenereEncrypt(plainText, keyword) {
    if ( typeof(plainText) !== 'string' ) {
      return 'invalid plainText. Must be string, not ' + typeof(plainText);
    }
    if ( typeof(keyword) !== 'string' ) {
      return 'invalid keyword. Must be string, not ' + typeof(keyword);
    }

    plainText = plainText.toLowerCase();
    keyword = keyword.match(/[a-z]/gi).join('').toLowerCase();
    let encryptedText = '';
    let specialCharacterCount = 0;

    for ( let i = 0; i < plainText.length; i++ ) {
      const keyLetter = (i - specialCharacterCount) % keyword.length;
      const keywordIndex = this.tabulaRecta.a.indexOf(keyword[keyLetter]);

      if ( this.tabulaRecta[plainText[i]] ) {
        encryptedText += this.tabulaRecta[plainText[i]][keywordIndex];
      } else {
        encryptedText += plainText[i];
        specialCharacterCount++;
      }
    }

    return encryptedText;
  }

  vigenereDecrypt(encryptedText, keyword) {
    if ( typeof(encryptedText) !== 'string' ) {
      return 'invalid encryptedText. Must be string, not ' + typeof(encryptedText);
    }
    if ( typeof(keyword) !== 'string' ) {
      return 'invalid keyword. Must be string, not ' + typeof(keyword);
    }

    encryptedText = encryptedText.toLowerCase();
    keyword = keyword.match(/[a-z]/gi).join('').toLowerCase();
    let decryptedText = '';
    let specialCharacterCount = 0;

    for ( let i = 0; i < encryptedText.length; i++ ) {
      const keyLetter = (i - specialCharacterCount) % keyword.length;
      const keyRow = this.tabulaRecta[keyword[keyLetter]];

      if ( keyRow.indexOf(encryptedText[i]) !== -1 ) {
        decryptedText += this.tabulaRecta.a[keyRow.indexOf(encryptedText[i])];
      } else {
        decryptedText += encryptedText[i];
        specialCharacterCount++;
      }
    }

    return decryptedText;
  }

  /* Vigenere Crypt End */


}
