import { Component, ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import {HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('videoElement', {static: true}) videoElement: ElementRef;
  video: any;
  imageUrl: string;

  @ViewChild('canvas', {static: true}) canvasElement: ElementRef;
  canvas: any;

  liveVideo: boolean;

  images: Array<Image>;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.video = this.videoElement.nativeElement;
    this.canvas = this.canvasElement.nativeElement;
    this.liveVideo = false;
    this.imageUrl = "";
    this.images = [];
  }

  start() {
    this.initCamera({ video: {
        optional: [
          {minWidth: 320},
          {minWidth: 640},
          {minWidth: 720},
          {minWidth: 1024},
          {minWidth: 1280},
          {minWidth: 1920},
          {minWidth: 2560},
        ]
      }
    });
  }

  stop() {
    this.video.srcObject.getTracks()[0].stop();
    this.liveVideo = false;
  }

  snapshot() {
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    this.canvas.getContext('2d').drawImage(this.video, 0, 0);
    //this.imageUrl = this.canvas.toDataURL('image/png');

    this.images.push(new Image(this.canvas.toDataURL('image/png')));

    // let formData = new FormData();
    // let picture = this.imageUrl.replace(/^data:image\/(webp|png|jpg|jpeg|);base64,/, "");
    // let blob = new Blob([picture], { type: "image/png"});
    //
    // formData.append('files', blob, 'file.png');
    //
  }

  private initCamera(config:any) {
    var browser = <any>navigator;

    browser.getUserMedia = (browser.getUserMedia ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia ||
      browser.msGetUserMedia);

    browser.mediaDevices.getUserMedia(config).then(stream => {
      this.video.srcObject = stream;
      this.liveVideo = true;
    }).catch(error => {
      console.log(error.message);
      this.liveVideo = false;
    });
  }

  removeImage(index) {
    this.images.splice(index, 1);
  }

  sendToServer() {
    this.images.map(image => {
      let picture = image.content.replace(/^data:image\/(webp|png|jpg|jpeg|);base64,/, "");
      image.content = picture;
    });

    this.http.post("http://localhost:8080/upload/dto", this.images,
      {
      observe: 'body',
      responseType: 'json'
    })
      .subscribe(
        err => {
          console.log(err);
        }
      );
  }

}

export class Image {
  content: string

  constructor(content) {
    this.content = content;
  }
}
