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

      switch (this.algorithm) {
        case "sezar": {
          this.messageText = this.ceasar_encrypt(this.messageText, { key: 30 });
          break;
        }
        case "vigenere": {
          this.messageText = this.vigenereEncrypt(this.messageText, this.vigenereKey);
          break;
        }
        case "polybius": {
          this.messageText = this.polybius_encrypt(this.messageText);
          break;
        }
        case "picket": {
          this.messageText = this.picket_fence_encrypt(this.messageText);
          break;
        }
        case "columnar": {
          this.messageText = this.columnar_encrypt(this.messageText);
          break;
        }
        default: {
          break;
        }
      }

      const data = {
        username: this.username,
        message: this.messageText,
        algorithm: this.algorithm
      };

      this.socket.emit('chat', data);
      this.messageText = "";

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
    this.socket.fromEvent('chat').subscribe((data: any) => {
      console.log(data);
      switch (data.algorithm) {
        case "sezar": {
          data.message = this.ceasar_decrypt(data.message, { key: 30 });
          break;
        }
        case "vigenere": {
          data.message = this.vigenereDecrypt(data.message, this.vigenereKey);
          break;
        }
        case "polybius": {
          data.message = this.polybius_decrypt(data.message);
          break;
        }
        case "picket": {
          data.message = this.picket_fence_decrypt(data.message);
          break;
        }
        case "columnar": {
          data.message = this.columnar_decrypt(data.message);
          break;
        }
        default: {
          break;
        }
      }

      this.messages.push(data);
      console.log(data);
    });
  }


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


  alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "v", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", " ", ".", ",", "?", "x", "w", "q"];

  alphabet_matris = [
    ["a", "b", "c", "d", "e", "f", "g"],
    ["h", "i", "j", "k", "l", "m", "n"],
    ["o", "p", "r", "s", "t", "u", "v"],
    ["y", "z", "1", "2", "3", "4", "5"],
    ["6", "7", "8", "9", "0", " ", "."],
    [",", "?", "w", "q", "x"]
  ];

  transpose(a) {
    return Object.keys(a[0]).map(function (c) {
      return a.map(function (r) { if (r[c]) { return r[c] } else { return "" }; });
    });
  }

  /* Vigenere Crypt */

  vigenereEncrypt(plainText, keyword) {
    if (typeof (plainText) !== 'string') {
      return 'invalid plainText. Must be string, not ' + typeof (plainText);
    }
    if (typeof (keyword) !== 'string') {
      return 'invalid keyword. Must be string, not ' + typeof (keyword);
    }

    plainText = plainText.toLowerCase();
    keyword = keyword.match(/[a-z]/gi).join('').toLowerCase();
    let encryptedText = '';
    let specialCharacterCount = 0;

    for (let i = 0; i < plainText.length; i++) {
      const keyLetter = (i - specialCharacterCount) % keyword.length;
      const keywordIndex = this.tabulaRecta.a.indexOf(keyword[keyLetter]);

      if (this.tabulaRecta[plainText[i]]) {
        encryptedText += this.tabulaRecta[plainText[i]][keywordIndex];
      } else {
        encryptedText += plainText[i];
        specialCharacterCount++;
      }
    }

    return encryptedText;
  }

  vigenereDecrypt(encryptedText, keyword) {
    if (typeof (encryptedText) !== 'string') {
      return 'invalid encryptedText. Must be string, not ' + typeof (encryptedText);
    }
    if (typeof (keyword) !== 'string') {
      return 'invalid keyword. Must be string, not ' + typeof (keyword);
    }

    encryptedText = encryptedText.toLowerCase();
    keyword = keyword.match(/[a-z]/gi).join('').toLowerCase();
    let decryptedText = '';
    let specialCharacterCount = 0;

    for (let i = 0; i < encryptedText.length; i++) {
      const keyLetter = (i - specialCharacterCount) % keyword.length;
      const keyRow = this.tabulaRecta[keyword[keyLetter]];

      if (keyRow.indexOf(encryptedText[i]) !== -1) {
        decryptedText += this.tabulaRecta.a[keyRow.indexOf(encryptedText[i])];
      } else {
        decryptedText += encryptedText[i];
        specialCharacterCount++;
      }
    }

    return decryptedText;
  }

  /* Vigenere Crypt End */

  /* Ceaser Crypt Start */

  // data.key = ötleme sayısı
  ceasar_encrypt(message, data) {
    let response = "";
    const long_alphabet = [...this.alphabet, ...this.alphabet];
    [...message].forEach(char => {
      char = char.toLowerCase();
      let index = this.alphabet.findIndex(item => item == char);
      if (index >= 0) {
        response += long_alphabet[index + data.key];
      }
    });
    return response;
  }

  ceasar_decrypt(text, data) {
    let response = "";
    [...text].forEach(char => {
      let index = this.alphabet.findIndex(item => item == char);
      if (index >= 0) {
        if (index - data.key >= 0) {
          response += this.alphabet[index - data.key];
        } else {
          response += this.alphabet[(index - data.key) + this.alphabet.length];
        }
      }
    });
    return response;
  }

  /* Ceaser Crypt End */

  /* Polybius Crypt Start */

  polybius_encrypt(message) {
    let response = "";
    [...message].forEach(char => {
      let row_index;
      let col_index;
      for (let i = 0; i < this.alphabet_matris.length; i++) {
        const temp_alphabet = this.alphabet_matris[i];
        let temp_index = temp_alphabet.findIndex(item => item == char);
        if (temp_index >= 0) {
          col_index = i;
          row_index = temp_index;
        }
      }
      if (row_index >= 0 && col_index >= 0) {
        response += col_index + "" + row_index;
      }
    });
    return response;
  }

  polybius_decrypt(text) {
    let response = "";
    let key_wait = true;
    let temp_col;
    [...text].forEach(char => {
      if (key_wait == true) {
        temp_col = char;
        key_wait = false;
      } else {
        response += this.alphabet_matris[parseInt(temp_col)][parseInt(char)];
        temp_col = null;
        key_wait = true;
      }
    });
    return response;
  }

  /* Polybius Crypt End */

  /* Picket Fence Crypt Start */
  picket_fence_encrypt(message) {
    let single = "";
    let double = "";
    [...message].forEach((char, index) => {
      if (index % 2 == 0) {
        double += char;
      } else {
        single += char;
      }
    });
    return double + single;
  }

  picket_fence_decrypt(text) {
    let response = "";
    let middle;
    if (text.length % 2 == 0) {
      middle = text.length / 2;
    } else {
      middle = (text.length + 1) / 2;
    }
    let start = true;
    let buffer = 0;
    for (let i = 0; i < text.length; i++) {
      if (start) {
        response += text[buffer];
        start = false;
      } else {
        response += text[buffer + middle];
        buffer++;
        start = true;
      }
    }
    return response;
  }

  /* Picket Fence Crypt End */

  /* Columnar Crypt Start */

  columnar_encrypt(message) {
    let response = "";
    let matris = [];
    let square = Math.sqrt(message.length);
    let size = Math.ceil(square);
    for (let i = 0; i < size; i++) {
      matris.push(message.substr(size * i, size));
    }
    let new_matris = this.transpose(matris);
    [...new_matris].forEach(item => {
      let word = "";
      [...item].forEach(char => {
        word += char;
      });
      response += word + "$";
    });
    return response;
  }

  columnar_decrypt(text) {
    let response = "";
    let matris = text.split("$");
    let new_matris = this.transpose(matris);
    [...new_matris].forEach(item => {
      let word = "";
      [...item].forEach(char => {
        word += char;
      });
      response += word
    });
    return response;
  }

  /* Columnar Crypt End */



}
