import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from "@angular/common/http";

interface VideoConfig {
  video: VideoOptionals;
}

class VideoOptionals {
  deviceId?: DeviceId;
}

interface DeviceId {
  exact: string;
}

class Image {
  content: string;

  constructor(content) {
    this.content = content;
  }
}

@Component({
  selector: 'capture',
  templateUrl: './capture.component.html',
  styleUrls: ['./capture.component.scss']
})
export class CaptureComponent implements OnInit {

  @ViewChild('videoElement', {static: true}) videoElement: ElementRef;
  video: any;

  @ViewChild('canvas', {static: true})
  canvasElement: ElementRef;

  canvas: HTMLCanvasElement;

  liveVideo: boolean = false;

  cameras: MediaDeviceInfo[] = [];

  selectedCamera: MediaDeviceInfo;

  defaultVideoConfig: VideoConfig = { video: {
      deviceId: null
    }
  };

  images: Image[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.video = this.videoElement.nativeElement;
    this.canvas = this.canvasElement.nativeElement;

    this.initCamera(this.defaultVideoConfig).then(()=>{
      navigator.mediaDevices.enumerateDevices().then((mediaDevices:MediaDeviceInfo[]) => {
        let cameras = [];
        mediaDevices.forEach((mediaDevice: MediaDeviceInfo) => {
          if (mediaDevice.kind === "videoinput") {
            cameras.push(mediaDevice)
          }
        });
        this.cameras = cameras;
        this.selectedCamera = this.cameras[0];
        this.stop();
      }).catch(error => {
        console.log(error.message);
      });
    });
  }

  start(): void {
    let videoConfiguration = this.defaultVideoConfig;
    if (this.selectedCamera) {
      videoConfiguration =  Object.assign(this.defaultVideoConfig);
      videoConfiguration.video.deviceId = {exact: this.selectedCamera.deviceId}
    }

    this.initCamera(videoConfiguration).then((stream: MediaStream) => {
      this.video.srcObject = stream;
      this.liveVideo = true;
    }).catch(error => {
      console.log(error.message);
      this.liveVideo = false;
    });
  }

  stop(): void {
    this.video.srcObject.getTracks().forEach((track: MediaStreamTrack) => {
      track.stop();
    });
    this.liveVideo = false;
  }

  snapshot(): void {
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    this.canvas.getContext('2d').drawImage(this.video, 0, 0);

    this.images.push(new Image(this.canvas.toDataURL('image/png')));
  }

  removeImage(index): void {
    this.images.splice(index, 1);
  }

  sendToServer(): void {
    let images = this.images.map(image => {
      let picture = image.content.replace(/^data:image\/(webp|png|jpg|jpeg|);base64,/, "");
      return new Image(picture);
    });

    this.http.post("http://localhost:8080/upload/dto", images,
      {
        observe: 'body',
        responseType: 'json'
      }).toPromise().catch((err) => console.log(err));
  }

  private initCamera(config): Promise<MediaStream> {
    let browser = <any>navigator;

    browser.getUserMedia = (browser.getUserMedia ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia ||
      browser.msGetUserMedia);

    return browser.mediaDevices.getUserMedia(config);
  }

}
